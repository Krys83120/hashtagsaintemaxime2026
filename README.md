# #SAINTEMAXIME 2026 – Next.js E-Commerce

> **Site e-commerce complet** pour la marque #SAINTEMAXIME.  
> Stack : Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion.  
> Prêt pour l'export statique et le déploiement sur Vercel.

---

## 🚀 Déploiement Rapide (3 étapes)

### 1. Initialiser le projet localement

```bash
# Créer un nouveau projet Next.js (si tu partes de zéro)
npx create-next-app@latest saintemaxime-2026 --typescript --tailwind --eslint --app --no-src-dir

# OU si tu utilises directement les fichiers fournis :
# 1. Copier tous les fichiers de ce dossier dans ton projet
# 2. Puis :
cd saintemaxime-2026
npm install
```

### 2. Lancer en local (test)

```bash
npm run dev
```
Ouvre [http://localhost:3000](http://localhost:3000)

### 3. Exporter et déployer sur Vercel

```bash
npm run build
```
Cela génère le dossier `dist/` (export statique) grâce à `output: 'export'` dans `next.config.js`.

#### Déploiement sur Vercel (recommandé)
1. Pousse le code sur **GitHub** :
```bash
git init
git add .
git commit -m "Initial commit #SAINTEMAXIME 2026"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/saintemaxime-2026.git
git push -u origin main
```
2. Va sur [vercel.com](https://vercel.com), clique **"Add New Project"**
3. Importe ton repo GitHub `saintemaxime-2026`
4. Framework Preset : **Next.js**
5. Build Command : `npm run build`
6. Output Directory : `dist`
7. Clique **Deploy** 🚀

#### Connecter ton nom de domaine
Dans Vercel > Settings > Domains :
- Ajoute `hashtagsaintemaxime.fr`
- Suivre les instructions DNS (généralement un CNAME vers `cname.vercel-dns.com.`)
- Attendre la propagation (quelques minutes)

---

## 📁 Structure du Projet

```
saintemaxime-2026/
├── app/
│   ├── layout.tsx          # Root layout (SEO, fonts, schema.org)
│   ├── page.tsx            # Homepage (Hero, Categories, Products, UGC, Newsletter)
│   ├── loading.tsx         # Loading state
│   ├── globals.css         # Tailwind + custom animations
│   ├── boutique/
│   │   └── page.tsx        # Grille produits
│   ├── produit/[slug]/
│   │   └── page.tsx        # Page produit détaillée (zoom, variantes, avis, cross-sell)
│   ├── la-marque/
│   │   └── page.tsx        # Storytelling marque
│   └── le-coeur-au-sol/
│       └── page.tsx        # Page virale UGC
├── components/
│   ├── Header.tsx          # #SAINTEMAXIME lifestyle en ligne + nav
│   ├── Footer.tsx          # 4 colonnes + réseaux sociaux
│   ├── TopBar.tsx          # Bannière promo été (dismissable)
│   ├── Hero.tsx            # Hero gradient océan avec #SAINTEMAXIME
│   ├── CategoryCard.tsx    # Cartes collections en glassmorphism
│   ├── ProductCard.tsx     # Carte produit avec badges + quick-add
│   ├── ProductDetail.tsx   # Galerie, zoom, variantes, avis
│   ├── SpinWheel.tsx       # 🎰 Roue de la Fortune (gamification)
│   ├── Newsletter.tsx      # 10% de bienvenue
│   ├── HeartLoader.tsx     # ❤️ Loader d'entrée #SAINTEMAXIME
│   ├── UGCChallenge.tsx    # Section "Le Cœur au Sol" virale
│   ├── Reviews.tsx         # Étoiles + avis clients
│   └── TrustBadge.tsx      # Notifications sociales live (FOMO)
├── lib/
│   ├── products.ts         # Données produits (mockées → remplacer par Printful API)
│   └── utils.ts            # Helpers (formatPrice, cn, etc.)
├── public/
│   └── images/
│       └── logo-saintemaxime.png
├── next.config.js          # Export statique + config images
├── tailwind.config.ts      # Design system (couleurs SM, fonts, animations)
└── package.json
```

---

## 🎨 Design System

| Couleur | Code | Usage |
|---------|------|-------|
| Bleu #SAINTEMAXIME | `#00D4E8` | Primary, boutons, accents |
| Bleu Profond | `#0085A1` | Titres, contrastes |
| Corail | `#FF6B8A` | Cœurs, badges, soldes, CTA secondaire |
| Blanc Pur | `#FFFFFF` | Fond |
| Blanc Cassé | `#F8FAFC` | Sections alternées |
| Noir Soft | `#1E293B` | Texte corps |

**Fonts** : Inter (corps) + Playfair Display (script "lifestyle")

---

## 🔌 Connexion Printful (API)

Le site utilise actuellement des **données mockées** dans `lib/products.ts`. Pour connecter l'API Printful en production :

### 1. Obtenir ton API Key Printful
- Va sur [printful.com](https://www.printful.com/dashboard) → API → Générer une clé
- Copie la clé API

### 2. Créer le fichier `.env.local`
```bash
cp .env.local.example .env.local
```

```env
# .env.local
PRINTFUL_API_KEY=sk_your_printful_api_key_here
```

### 3. Implémenter le fetch Printful
Crée un fichier `lib/printful.ts` :

```typescript
const PRINTFUL_API_URL = "https://api.printful.com/v2";

export async function getPrintfulProducts() {
  const res = await fetch(`${PRINTFUL_API_URL}/catalog-products`, {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch Printful products");
  return res.json();
}
```

> **Note** : Pour l'export statique, les données Printful doivent être fetchées au **build time** (pas au runtime). Remplace les données mockées par un script de génération si nécessaire.

---

## 🛒 Fonctionnalités E-Commerce

- ✅ **Pages produit A+** : zoom, variantes (couleur/taille), badges, avis
- ✅ **Panier** : affichage dans le header (à connecter avec Printful ou Shopify Buy Button)
- ✅ **Gamification** : Roue de la Fortune avec email capture
- ✅ **Fidélité** : Badges de niveaux (à implémenter avec localStorage + backend)
- ✅ **Newsletter** : 10% de bienvenue (connecter à Mailchimp ou Brevo)
- ✅ **SEO parfait** : Meta tags, Open Graph, Schema.org, JSON-LD, H1/H2 structurés
- ✅ **Animations** : Framer Motion (scroll reveal, hover 3D, heartbeat logo)
- ✅ **Responsive** : Mobile-first, touch-friendly
- ✅ **Performance** : Static export, images optimisées, Core Web Vitals ready

---

## 📝 Pages & SEO

| Page | URL | H1 |
|------|-----|-----|
| Accueil | `/` | La Marque Officielle #SAINTEMAXIME – Souvenirs & Lifestyle de Sainte-Maxime |
| Boutique | `/boutique/` | Boutique #SAINTEMAXIME – Tous les Produits |
| Produit | `/produit/[slug]/` | [Nom Produit] – Collection Été 2026 |
| La Marque | `/la-marque/` | La Marque #SAINTEMAXIME – Histoire & Lifestyle depuis 2019 |
| Le Cœur au Sol | `/le-coeur-au-sol/` | Le Cœur au Sol #SAINTEMAXIME – L'Expérience Instagrammable |

---

## 🚀 Prochaines étapes recommandées

1. **Remplacer les mockups** par les vraies images de produits (Printful mockups en 4K)
2. **Connecter le panier** : utiliser Printful API pour les commandes, ou intégrer Shopify Buy Button / Stripe Checkout
3. **Newsletter** : connecter l'input email à Mailchimp (API key dans .env.local)
4. **Roue de la Fortune** : persister les gains dans localStorage + envoyer par email
5. **Avis clients** : intégrer un service d'avis (Judge.me, Yotpo, ou custom avec Airtable)
6. **Blog** : ajouter `/app/magazine/` pour le SEO longue traîne
7. **Filtre Instagram AR** : créer le filtre Spark AR (hors scope code, mais lié à la page "Le Cœur au Sol")
8. **QR Code** : générer un QR code statique pointant vers la promo -10%

---

## 🆘 Support

- Problème de build ? Vérifie que `next.config.js` a bien `output: 'export'`
- Images qui ne s'affichent pas ? Vérifie que `images.unoptimized: true` est activé
- SEO non visible ? Vérifie les balises `<meta>` dans `app/layout.tsx` et chaque `page.tsx`

---

> **#SAINTEMAXIME – L'Esprit du Golfe de Saint-Tropez. ❤️💎**
