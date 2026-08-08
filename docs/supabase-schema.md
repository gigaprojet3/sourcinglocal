# SourcingLocal — Schéma SQL pour Supabase

Copie le script SQL ci-dessous dans l'éditeur SQL de Supabase
(**Dashboard → SQL Editor → New query**) puis clique sur **Run**.

> Ce script crée toutes les tables, contraintes, index et valeurs par défaut
> du projet SourcingLocal. Il est idempotent : l'instruction `CREATE TABLE IF NOT EXISTS`
> ne recrée pas une table déjà existante.

---

## Script SQL complet

```sql
-- ============================================================
-- SOURCING LOCAL — Schéma PostgreSQL
-- Compatible Supabase (schéma public)
-- ============================================================

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid() disponible


-- ────────────────────────────────────────────────────────────
-- TABLE : User
-- Comptes acheteurs (BUYER), vendeurs (SELLER) et admins
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
  "id"               TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "email"            TEXT        NOT NULL,
  "password"         TEXT        NOT NULL,
  "name"             TEXT        NOT NULL,
  "phone"            TEXT,
  "avatar"           TEXT,                          -- URL Cloudinary ou JSON {country, city}
  "role"             TEXT        NOT NULL DEFAULT 'BUYER', -- 'BUYER' | 'SELLER' | 'ADMIN'

  -- Préférences de notifications
  "notifNewMessage"  BOOLEAN     NOT NULL DEFAULT TRUE,
  "notifNewContact"  BOOLEAN     NOT NULL DEFAULT TRUE,
  "notifNewsletter"  BOOLEAN     NOT NULL DEFAULT FALSE,

  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "User_pkey"  PRIMARY KEY ("id"),
  CONSTRAINT "User_email_key" UNIQUE ("email")
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");


-- ────────────────────────────────────────────────────────────
-- TABLE : Shop
-- Profil boutique d'un vendeur (1 vendeur = 1 boutique max)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Shop" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "logo"        TEXT,
  "banner"      TEXT,
  "city"        TEXT,
  "country"     TEXT        NOT NULL DEFAULT 'Sénégal',
  "address"     TEXT,
  "whatsapp"    TEXT,                               -- Numéro WhatsApp international
  "isVerified"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ownerId"     TEXT        NOT NULL,               -- FK → User.id

  CONSTRAINT "Shop_pkey"    PRIMARY KEY ("id"),
  CONSTRAINT "Shop_slug_key" UNIQUE ("slug"),
  CONSTRAINT "Shop_ownerId_key" UNIQUE ("ownerId"),    -- 1 boutique par vendeur
  CONSTRAINT "Shop_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Shop_slug_idx" ON "Shop"("slug");


-- ────────────────────────────────────────────────────────────
-- TABLE : Category
-- Catégories de produits (5 catégories fixes pour la V1)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Category" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "icon"        TEXT,                               -- Nom de l'icône Lucide
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Category_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "Category_name_key" UNIQUE ("name"),
  CONSTRAINT "Category_slug_key" UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug");


-- ────────────────────────────────────────────────────────────
-- TABLE : Product
-- Produits publiés par les vendeurs
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "priceCfa"    INTEGER     NOT NULL,               -- Prix en francs CFA (entier)
  "images"      TEXT        NOT NULL,               -- JSON array d'URLs Cloudinary (max 2)
  "origin"      TEXT,                               -- Ex: "Dakar, Sénégal"
  "inStock"     BOOLEAN     NOT NULL DEFAULT TRUE,
  "isActive"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "isFeatured"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "viewCount"   INTEGER     NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "shopId"      TEXT        NOT NULL,               -- FK → Shop.id

  CONSTRAINT "Product_pkey"    PRIMARY KEY ("id"),
  CONSTRAINT "Product_slug_key" UNIQUE ("slug"),
  CONSTRAINT "Product_shopId_fkey"
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Product_shopId_idx"    ON "Product"("shopId");
CREATE INDEX IF NOT EXISTS "Product_inStock_idx"   ON "Product"("inStock");
CREATE INDEX IF NOT EXISTS "Product_isFeatured_idx" ON "Product"("isFeatured");
CREATE INDEX IF NOT EXISTS "Product_slug_idx"      ON "Product"("slug");


-- ────────────────────────────────────────────────────────────
-- TABLE : ProductCategory
-- Table de jointure many-to-many Produit ↔ Catégorie (max 3 par produit)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ProductCategory" (
  "productId"  TEXT NOT NULL,                       -- FK → Product.id
  "categoryId" TEXT NOT NULL,                       -- FK → Category.id

  CONSTRAINT "ProductCategory_pkey"
    PRIMARY KEY ("productId", "categoryId"),
  CONSTRAINT "ProductCategory_productId_fkey"
    FOREIGN KEY ("productId")  REFERENCES "Product"("id")  ON DELETE CASCADE,
  CONSTRAINT "ProductCategory_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductCategory_productId_idx"  ON "ProductCategory"("productId");
CREATE INDEX IF NOT EXISTS "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");


-- ────────────────────────────────────────────────────────────
-- TABLE : Review
-- Avis d'un acheteur sur un produit (1 avis max par produit par user)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Review" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "rating"    INTEGER     NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "comment"   TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "authorId"  TEXT        NOT NULL,                 -- FK → User.id
  "productId" TEXT        NOT NULL,                 -- FK → Product.id

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Review_authorId_productId_key" UNIQUE ("authorId", "productId"),
  CONSTRAINT "Review_authorId_fkey"
    FOREIGN KEY ("authorId")  REFERENCES "User"("id")    ON DELETE CASCADE,
  CONSTRAINT "Review_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");


-- ────────────────────────────────────────────────────────────
-- TABLE : Subscription
-- Abonnement mensuel d'un acheteur (1 abonnement par buyer)
-- Plan unique : Découverte — 1 000 FCFA/mois
-- Statuts : INACTIVE | ACTIVE | CANCELLED | PAST_DUE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id"                 TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "status"             TEXT        NOT NULL DEFAULT 'INACTIVE',
  "planName"           TEXT        NOT NULL DEFAULT 'STARTER',
  "priceCfa"           INTEGER     NOT NULL,
  "currentPeriodStart" TIMESTAMPTZ NOT NULL,
  "currentPeriodEnd"   TIMESTAMPTZ NOT NULL,
  "geniuspayRef"       TEXT,                        -- Référence transaction GeniusPay (MTX-...)
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "userId"             TEXT        NOT NULL,         -- FK → User.id

  CONSTRAINT "Subscription_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_userId_key" UNIQUE ("userId"),  -- 1 abonnement par user
  CONSTRAINT "Subscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");


-- ────────────────────────────────────────────────────────────
-- TABLE : Message
-- Messages entre acheteurs et vendeurs
-- (accès réservé aux buyers avec abonnement actif)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Message" (
  "id"         TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "content"    TEXT        NOT NULL,
  "isRead"     BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "senderId"   TEXT        NOT NULL,                -- FK → User.id (expéditeur)
  "receiverId" TEXT        NOT NULL,                -- FK → User.id (destinataire)

  CONSTRAINT "Message_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Message_senderId_fkey"
    FOREIGN KEY ("senderId")   REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Message_receiverId_fkey"
    FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Message_senderId_idx"   ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "Message_receiverId_idx" ON "Message"("receiverId");


-- ────────────────────────────────────────────────────────────
-- TRIGGER : updatedAt automatique sur toutes les tables
-- Supabase ne met pas à jour updatedAt automatiquement — ce trigger le fait
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur chaque table qui a updatedAt
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['User','Shop','Product','Review','Subscription']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON "%s";
       CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON "%s"
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      t, t
    );
  END LOOP;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- DONNÉES INITIALES : Catégories
-- ────────────────────────────────────────────────────────────
INSERT INTO "Category" ("id", "name", "slug", "icon") VALUES
  ('cat_mode',    'Mode & Vêtements',        'mode-vetements',    'Shirt'),
  ('cat_beaute',  'Beauté & Soins',           'beaute-soins',      'Sparkles'),
  ('cat_maison',  'Maison & Décoration',      'maison-decoration', 'Home'),
  ('cat_elec',    'Électronique & High-Tech', 'electronique',      'Cpu'),
  ('cat_sport',   'Sport & Fitness',          'sport-fitness',     'Dumbbell')
ON CONFLICT ("slug") DO NOTHING;
```

---

## Ordre d'exécution

Les tables sont créées dans l'ordre des dépendances :

```
User
 └── Shop         (FK → User)
 └── Review       (FK → User, Product)
 └── Subscription (FK → User)
 └── Message      (FK → User × 2)

Category
 └── ProductCategory (FK → Product, Category)

Shop
 └── Product      (FK → Shop)
      └── ProductCategory (FK → Product, Category)
      └── Review          (FK → Product)
```

---

## Notes importantes

| Point | Détail |
|---|---|
| **Clé primaire** | `TEXT` avec `gen_random_uuid()` — compatible avec les IDs Prisma `cuid()` |
| **Dates** | `TIMESTAMPTZ` (avec fuseau horaire) |
| **`updatedAt`** | Mis à jour automatiquement par le trigger `set_updated_at` |
| **`images`** | Stocké en `TEXT` (JSON stringifié) — ex: `["https://res.cloudinary.com/..."]` |
| **`avatar`** | URL Cloudinary OU JSON `{"country":"CG","city":"Brazzaville"}` |
| **`priceCfa`** | `INTEGER` — prix en francs CFA sans décimales |
| **`role`** | `TEXT` — valeurs : `BUYER`, `SELLER`, `ADMIN` |
| **`status` Subscription** | `TEXT` — valeurs : `INACTIVE`, `ACTIVE`, `CANCELLED`, `PAST_DUE` |

---

## Vérifier les tables créées

Après exécution du script, vérifie que toutes les tables sont présentes :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Résultat attendu :

```
Category
Message
Product
ProductCategory
Review
Shop
Subscription
User
```
