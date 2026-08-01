import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSumupCheckout } from "@/lib/sumup";
import ClearCartOnMount from "@/components/ClearCartOnMount";

interface Props {
  searchParams: { ref?: string };
}

async function verifyAndFinalizeOrder(orderNumber: string) {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { status: "not_found" as const };
  if (order.status === "paid") return { status: "paid" as const };
  if (order.status === "cancelled") return { status: "cancelled" as const };

  // On ne fait confiance qu'à SumUp pour confirmer un paiement, jamais à l'URL de retour seule.
  const checkoutIdMatch = (order.notes || "").match(/sumup_id:([a-zA-Z0-9-]+)/);
  if (!checkoutIdMatch) return { status: "pending" as const };

  try {
    const sumupCheckout = await getSumupCheckout(checkoutIdMatch[1]);

    if (sumupCheckout.status === "PAID") {
      await admin.from("orders").update({ status: "paid" }).eq("order_number", orderNumber);
      return { status: "paid" as const };
    }
    if (sumupCheckout.status === "FAILED" || sumupCheckout.status === "EXPIRED") {
      await admin.from("orders").update({ status: "cancelled" }).eq("order_number", orderNumber);
      return { status: "cancelled" as const };
    }
    return { status: "pending" as const };
  } catch {
    return { status: "pending" as const };
  }
}

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const ref = searchParams.ref;

  if (!ref) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <XCircle className="w-16 h-16 text-sm-coral mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-sm-dark mb-3">Commande introuvable</h1>
        <Link href="/boutique/" className="inline-block bg-sm-cyan text-white font-semibold px-8 py-3 rounded-full hover:bg-sm-deep transition-colors">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const result = await verifyAndFinalizeOrder(ref);

  if (result.status === "not_found") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <XCircle className="w-16 h-16 text-sm-coral mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-sm-dark mb-3">Commande introuvable</h1>
        <p className="text-sm-gray mb-8">Cette référence de commande n'existe pas.</p>
        <Link href="/boutique/" className="inline-block bg-sm-cyan text-white font-semibold px-8 py-3 rounded-full hover:bg-sm-deep transition-colors">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  if (result.status === "paid") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ClearCartOnMount />
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-sm-dark mb-3">Merci pour ta commande !</h1>
        <p className="text-sm-gray mb-2">Commande <strong>{ref}</strong> confirmée.</p>
        <p className="text-sm-gray mb-8">
          Ton paiement a bien été reçu. Tu vas recevoir un email de confirmation avec le détail de ta commande.
        </p>
        <Link href="/boutique/" className="inline-block bg-sm-cyan text-white font-semibold px-8 py-3 rounded-full hover:bg-sm-deep transition-colors">
          Continuer mes achats
        </Link>
      </div>
    );
  }

  // pending / cancelled / autre : le paiement n'est pas (encore) confirmé
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-sm-dark mb-3">Paiement en cours de vérification</h1>
      <p className="text-sm-gray mb-8">
        Commande <strong>{ref}</strong> — si tu viens de payer, ça peut prendre quelques instants.
        Rafraîchis cette page dans une minute, ou contacte-nous si le souci persiste.
      </p>
      <Link href="/boutique/" className="inline-block bg-sm-cyan text-white font-semibold px-8 py-3 rounded-full hover:bg-sm-deep transition-colors">
        Retour à la boutique
      </Link>
    </div>
  );
}
