import Link from "next/link";
import { Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: { token: string };
}

const steps = [
  { key: "pending", label: "Commande reçue", icon: Clock },
  { key: "paid", label: "Paiement confirmé", icon: CheckCircle2 },
  { key: "processing", label: "En préparation", icon: Package },
  { key: "shipped", label: "Expédiée", icon: Truck },
  { key: "delivered", label: "Livrée", icon: CheckCircle2 },
];

export default async function SuiviCommandePage({ params }: Props) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("tracking_token", params.token)
    .maybeSingle();

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <XCircle className="w-16 h-16 text-sm-coral mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-sm-dark mb-3">Lien de suivi invalide</h1>
        <p className="text-sm-gray mb-8">Ce lien ne correspond à aucune commande.</p>
        <Link href="/boutique/" className="inline-block bg-sm-cyan text-white font-semibold px-8 py-3 rounded-full hover:bg-sm-deep transition-colors">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-sm-dark mb-2">Suivi de ta commande</h1>
        <p className="text-sm-gray">
          {order.order_number} — {new Date(order.created_at).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8">
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p className="font-semibold text-red-700">
            {order.status === "cancelled" ? "Cette commande a été annulée." : "Cette commande a été remboursée."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-sm-lightgray p-6 sm:p-8 mb-8">
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-sm-lightgray" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-sm-cyan transition-all"
              style={{ width: `${Math.max(0, currentStepIndex) / (steps.length - 1) * 100}%` }}
            />
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const reached = i <= currentStepIndex;
              return (
                <div key={step.key} className="relative flex flex-col items-center gap-2 z-10 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    reached ? "bg-sm-cyan border-sm-cyan text-white" : "bg-white border-sm-lightgray text-sm-gray"
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] text-center font-medium ${reached ? "text-sm-dark" : "text-sm-gray"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.tracking_number && (
        <div className="bg-sm-cream rounded-2xl p-6 mb-8 text-center">
          <p className="text-xs font-bold text-sm-gray uppercase tracking-wider mb-1">Numéro de suivi {order.carrier ? `(${order.carrier})` : ""}</p>
          <p className="text-lg font-mono font-bold text-sm-dark">{order.tracking_number}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-sm-lightgray p-6">
        <h2 className="font-bold text-sm-dark mb-4">Articles</h2>
        <div className="space-y-2 mb-4">
          {(order.items || []).map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-sm-dark">{item.name} × {item.qty}</span>
              <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-3 border-t border-sm-lightgray font-bold">
          <span className="text-sm-dark">Total</span>
          <span className="text-sm-cyan">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
