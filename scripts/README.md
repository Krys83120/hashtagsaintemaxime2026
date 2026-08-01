# Scripts #SAINTEMAXIME — Synchronisation Printful

## 🖨️ Scripts disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| **Manuel** | `npm run sync:printful` | Sync basique, écrase tout |
| **Auto** | `npm run sync:auto` | Sync incrémentale, préserve les données manuelles |
| **Dry-run** | `npm run sync:dry-run` | Simulation, aucune écriture |
| **Auto + Build** | `npm run sync:build` | Sync puis build Next.js |
| **Auto + Cron** | `npm run sync:watch` | Sync toutes les 6h + build |
| **Webhook** | `npm run sync:webhook` | Serveur webhook pour sync instantanée |

---

## 🚀 Démarrage rapide

### 1. Configuration

Crée un fichier `.env` à la racine :

```env
PRINTFUL_API_KEY=<TA_CLE_API_PRINTFUL_ICI>
```

> Récupère ta clé sur [Printful → API → Tokens](https://www.printful.com/dashboard/settings/api)

### 2. Sync manuelle (première fois)

```bash
npm run sync:auto
```

### 3. Sync automatique programmée

**Option A — Cron système (Linux/Mac)**

```bash
crontab -e
# Ajoute cette ligne pour toutes les 6h :
0 */6 * * * cd /chemin/vers/saintemaxime-2026 && npm run sync:auto >> logs/cron.log 2>&1
```

**Option B — Windows Task Scheduler**

1. Crée une tâche planifiée
2. Déclencheur : tous les 6 heures
3. Action : `node.exe scripts/auto-sync-printful.js`
4. Dossier de départ : `C:\...\saintemaxime-2026`

**Option C — node-cron (intégré)**

```bash
# Sync + build toutes les 6h
npm run sync:watch

# Ou planification personnalisée
node scripts/auto-sync-printful.js --schedule "0 9,21 * * *" --build
```

> Nécessite `npm install node-cron` pour le mode planifié intégré.

---

## 🔄 Fonctionnement de la sync incrémentale

Le script `auto-sync-printful.js` est **intelligent** :

1. **Charge** les produits existants depuis `data/products.json`
2. **Récupère** les produits Printful via API v2
3. **Merge** les données :
   - Nouveaux produits Printful → **créés**
   - Produits existants Printful → **mis à jour** (prix, stock, images)
   - Produits manuels (`source: "manual"`) → **préservés** (avis, badges, descriptions custom)
4. **Sauvegarde** un backup dans `data/backups/`
5. **Écrit** le nouveau `data/products.json`
6. **Log** détaillé dans `logs/sync-YYYY-MM-DD.log`

### Champs préservés automatiquement

| Champ | Comportement |
|-------|-------------|
| `reviews` | Toujours conservé (avis clients) |
| `badge` | Conservé si défini manuellement |
| `description` | Conservé si `source === "manual"` |
| `details` | Conservé si `source === "manual"` et > 4 items |
| `stockCount` | Conservé si défini manuellement |
| `image` | Conservée si pas placeholder |

---

## 🌐 Mode Webhook (sync instantanée)

Printful peut notifier ton site quand un produit change :

```bash
npm run sync:webhook
# → Serveur écoute sur http://localhost:3001/webhook/printful
```

Configure dans Printful Dashboard :
- **URL** : `https://ton-site.com/webhook/printful`
- **Events** : `product_updated`, `product_created`, `stock_updated`

> En production, utilise un tunnel comme ngrok pour tester localement.

---

## 📁 Architecture des données

```
saintemaxime-2026/
├── data/
│   ├── products.json          ← Données produits (généré par sync)
│   ├── sync-config.json       ← Configuration du sync
│   └── backups/
│       └── products-1687...json  ← Backups automatiques
├── lib/
│   └── products.ts            ← Types + import JSON
├── logs/
│   └── sync-2026-07-18.log    ← Logs quotidiens
└── scripts/
    ├── sync-printful.js       ← Script basique (legacy)
    └── auto-sync-printful.js  ← Script automatique
```

---

## ⚙️ Personnalisation

Modifie `data/sync-config.json` :

```json
{
  "marginMultiplier": 1.5,
  "defaultBadgeNew": "NOUVEAU",
  "defaultBadgeBestseller": "BESTSELLER",
  "preserveManualFields": ["reviews", "badge", "description"],
  "autoBuild": false,
  "logRetentionDays": 30
}
```

---

## 🛠️ Dépannage

### Erreur "Fichier .env introuvable"
→ Crée `.env` avec `PRINTFUL_API_KEY=<CLE_API_PRINTFUL>`

### Erreur "Aucun store Printful trouvé"
→ Vérifie que ta clé API a les droits `read` sur les stores

### Produits manuels écrasés
→ Vérifie que `source: "manual"` est bien défini dans `data/products.json`

### Build échoue après sync
→ Lance `npm run sync:dry-run` pour voir ce qui change sans écrire

---

## 📊 Exemple de sortie

```
═══════════════════════════════════════════════
  🖨️  AUTO-SYNC PRINTFUL → #SAINTEMAXIME
═══════════════════════════════════════════════
Mode : ÉCRITURE
8 produits existants chargés
📡 Récupération des stores Printful...
✅ Store : #SAINTEMAXIME Store (ID: 12345678)
📡 Récupération des produits...
✅ 12 produits trouvés sur Printful
🔄 Mapping et fusion incrémentale...
3 produits manuels conservés
───────────────────────────────────────────────
✅ RÉSUMÉ — Créés: 4 | Mis à jour: 5 | Inchangés: 3 | Manuels conservés: 3
───────────────────────────────────────────────
```
