# GenXPac

Plateforme B2B de pré-commande : importez des produits de Chine et vendez aux
boutiques tunisiennes. Les boutiques parcourent un catalogue, pré-commandent des
quantités, et l'administrateur agrège la demande avant de passer une commande
groupée en Chine.

> Built with Next.js 14 (App Router), Supabase, Tailwind CSS. UI trilingue
> (Français / العربية / English).

---

## Fonctionnalités

**Administrateur**
- Tableau de bord (statistiques, chiffre d'affaires potentiel, activité récente)
- Gestion des produits (formulaire multilingue, upload d'images + import par URL)
- Import en masse via CSV / Excel (.csv, .xls, .xlsx)
- Commandes agrégées par produit (unités totales, nombre de boutiques)
- Mise à jour des statuts (en attente → confirmé → commandé → arrivé → livré)
- Lots Chine (regrouper les pré-commandes à commander ensemble)
- Validation des comptes boutiques
- Messagerie avec les clients

**Boutiques (clients)**
- Inscription (validée par l'admin)
- Catalogue avec filtres (catégorie, marque, prix, recherche)
- Fiche produit + pré-commande (quantité, note)
- Suivi des commandes en temps réel
- Messagerie / négociation par commande

---

## Mise en route

### 1. Installer les dépendances

```bash
npm install
```

### 2. Variables d'environnement

Copiez `.env.example` vers `.env.local` et renseignez vos clés Supabase
(Dashboard → Project Settings → API) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Créer la base de données

Ouvrez **Supabase Dashboard → SQL Editor → New query**, collez le contenu de
[`supabase/schema.sql`](./supabase/schema.sql) et exécutez-le. Cela crée :

- toutes les tables (`profiles`, `categories`, `products`, `preorders`,
  `batches`, `messages`)
- les politiques RLS (Row Level Security)
- le trigger de création automatique de profil à l'inscription
- le bucket de stockage public `product-images`
- quelques catégories par défaut

### 4. Créer le compte administrateur

```bash
node scripts/seed-admin.mjs votre-email@exemple.com VotreMotDePasse
```

Sans arguments, le script utilise `samir22092003@gmail.com` / `Admin123!`.
Le script crée l'utilisateur et le promeut administrateur (`role = admin`,
`approved = true`).

> ⚠️ Le script doit pouvoir joindre Supabase sur le réseau. Si vous l'exécutez
> depuis Claude Code on the web, ajoutez d'abord le host Supabase aux
> *network egress settings* de l'environnement.

### 5. Lancer en développement

```bash
npm run dev
```

Ouvrez http://localhost:3000.

---

## Déploiement (Vercel)

1. Poussez le dépôt sur GitHub.
2. Importez le projet dans Vercel.
3. Ajoutez les 3 variables d'environnement.
4. Déployez. Aucune configuration supplémentaire n'est nécessaire pour Next.js.

---

## Import CSV / Excel

Colonnes reconnues (insensible à la casse) :

| Colonne          | Description                                       |
|------------------|---------------------------------------------------|
| `name_en`        | Nom (obligatoire ; `name` ou `nom` acceptés)      |
| `name_fr`        | Nom en français                                   |
| `name_ar`        | Nom en arabe                                       |
| `brand`          | Marque                                            |
| `selling_price`  | Prix de vente (TND)                               |
| `cost_price`     | Prix d'achat (CNY)                                |
| `min_order_qty`  | Quantité minimum                                  |
| `unit`           | Unité (pièce, kg…)                                |
| `tags`           | Étiquettes séparées par `;` ou `,`                |
| `images`         | URLs d'images séparées par `;`                    |

Un modèle est fourni : [`supabase/sample-products.csv`](./supabase/sample-products.csv).

---

## Structure

Voir [`PROJECT.md`](./PROJECT.md) pour la documentation complète (objectifs,
schéma, feuille de route et avancement).
