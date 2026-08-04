import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | #SAINTEMAXIME®",
  robots: { index: false, follow: true },
};

export default function CGVPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose prose-sm">
      <h1 className="text-3xl font-bold text-sm-dark mb-2">Conditions Générales de Vente</h1>
      <p className="text-sm-gray mb-10">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

      <div className="space-y-8 text-sm-dark">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits réalisées sur le site
            #SAINTEMAXIME® (hashtagsaintemaxime.fr), édité par la marque #SAINTEMAXIME®, Sainte-Maxime, France.
            Toute commande passée sur le site implique l'acceptation sans réserve des présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Produits</h2>
          <p>
            Les produits proposés à la vente sont ceux figurant sur le site au jour de la consultation, dans la limite
            des stocks disponibles. Les photographies et textes illustrant les produits ne sont pas contractuels.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Prix</h2>
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises (TTC). #SAINTEMAXIME® se réserve le droit de
            modifier ses prix à tout moment, étant entendu que le prix applicable est celui en vigueur au moment de
            la validation de la commande.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Commande</h2>
          <p>
            La commande est validée après acceptation des présentes CGV et paiement intégral du montant dû. Un email
            de confirmation est envoyé au client après validation du paiement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Paiement</h2>
          <p>
            Le paiement s'effectue en ligne, de manière sécurisée, via notre prestataire de paiement SumUp. Les
            données bancaires du client ne sont jamais stockées sur les serveurs de #SAINTEMAXIME®.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Livraison</h2>
          <p>
            Les produits sont livrés à l'adresse indiquée par le client lors de la commande, dans un délai indicatif
            de 3 à 5 jours ouvrés. Les délais de livraison sont donnés à titre indicatif et un retard raisonnable ne
            saurait donner lieu à annulation de la commande ni à dommages et intérêts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Droit de rétractation</h2>
          <p>
            Conformément à la législation en vigueur, le client dispose d'un délai de 14 jours à compter de la
            réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motif ni à
            payer de pénalités, à l'exception des frais de retour. Les produits doivent être retournés neufs, non
            portés/utilisés, dans leur emballage d'origine.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">8. Retours et remboursements</h2>
          <p>
            Pour toute demande de retour, contacte-nous à l'adresse contact@hashtagsaintemaxime.fr. Après réception
            et vérification du produit retourné, le remboursement est effectué dans un délai de 14 jours via le même
            moyen de paiement que celui utilisé pour la commande.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">9. Garanties</h2>
          <p>
            Les produits vendus bénéficient de la garantie légale de conformité et de la garantie contre les vices
            cachés, dans les conditions prévues par le Code de la consommation et le Code civil.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">10. Propriété intellectuelle</h2>
          <p>
            La marque #SAINTEMAXIME® ainsi que l'ensemble des éléments du site (textes, images, logos) sont protégés
            par le droit de la propriété intellectuelle et demeurent la propriété exclusive de #SAINTEMAXIME®.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">11. Données personnelles</h2>
          <p>
            Les données collectées lors de la commande sont utilisées exclusivement dans le cadre du traitement de
            celle-ci et de la relation client, conformément à notre politique de confidentialité et au RGPD.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">12. Litiges</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée
            avant toute action judiciaire. À défaut, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Contact</h2>
          <p>
            Pour toute question relative à ces CGV : contact@hashtagsaintemaxime.fr
          </p>
        </section>
      </div>
    </div>
  );
}
