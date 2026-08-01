import Link from "next/link";
import { XCircle } from "lucide-react";

export default function OrderCancelledPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <XCircle className="w-16 h-16 text-sm-coral mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-sm-dark mb-3">Paiement annulé</h1>
      <p className="text-sm-gray mb-8">
        Aucun montant n'a été débité. Ton panier est toujours disponible si tu veux réessayer.
      </p>
      <Link
        href="/boutique/"
        className="inline-block bg-sm-cyan text-white font-semibold px-8 py-3 rounded-full hover:bg-sm-deep transition-colors"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
