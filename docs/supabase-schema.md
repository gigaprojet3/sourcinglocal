```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "User" (
  "id"               TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "email"            TEXT        NOT NULL,
  "password"         TEXT        NOT NULL,
  "name"             TEXT        NOT NULL,
  "phone"            TEXT,
  "avatar"           TEXT,
  "role"             TEXT        NOT NULL DEFAULT 'BUYER',
  "notifNewMessage"  BOOLEAN     NOT NULL DEFAULT TRUE,
  "notifNewContact"  BOOLEAN     NOT NULL DEFAULT TRUE,
  "notifNewsletter"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "User_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "User_email_key" UNIQUE ("email")
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

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
  "whatsapp"    TEXT,
  "isVerified"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ownerId"     TEXT        NOT NULL,
  CONSTRAINT "Shop_pkey"        PRIMARY KEY ("id"),
  CONSTRAINT "Shop_slug_key"    UNIQUE ("slug"),
  CONSTRAINT "Shop_ownerId_key" UNIQUE ("ownerId"),
  CONSTRAINT "Shop_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Shop_slug_idx" ON "Shop"("slug");

CREATE TABLE IF NOT EXISTS "Category" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "icon"        TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Category_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "Category_name_key" UNIQUE ("name"),
  CONSTRAINT "Category_slug_key" UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug");

CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "priceCfa"    INTEGER     NOT NULL,
  "images"      TEXT        NOT NULL,
  "origin"      TEXT,
  "inStock"     BOOLEAN     NOT NULL DEFAULT TRUE,
  "isActive"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "isFeatured"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "viewCount"   INTEGER     NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "shopId"      TEXT        NOT NULL,
  CONSTRAINT "Product_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "Product_slug_key" UNIQUE ("slug"),
  CONSTRAINT "Product_shopId_fkey"
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Product_shopId_idx"     ON "Product"("shopId");
CREATE INDEX IF NOT EXISTS "Product_inStock_idx"    ON "Product"("inStock");
CREATE INDEX IF NOT EXISTS "Product_isFeatured_idx" ON "Product"("isFeatured");
CREATE INDEX IF NOT EXISTS "Product_slug_idx"       ON "Product"("slug");

CREATE TABLE IF NOT EXISTS "ProductCategory" (
  "productId"  TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  CONSTRAINT "ProductCategory_pkey"
    PRIMARY KEY ("productId", "categoryId"),
  CONSTRAINT "ProductCategory_productId_fkey"
    FOREIGN KEY ("productId")  REFERENCES "Product"("id")  ON DELETE CASCADE,
  CONSTRAINT "ProductCategory_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductCategory_productId_idx"  ON "ProductCategory"("productId");
CREATE INDEX IF NOT EXISTS "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

CREATE TABLE IF NOT EXISTS "Review" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "rating"    INTEGER     NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "comment"   TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "authorId"  TEXT        NOT NULL,
  "productId" TEXT        NOT NULL,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Review_authorId_productId_key" UNIQUE ("authorId", "productId"),
  CONSTRAINT "Review_authorId_fkey"
    FOREIGN KEY ("authorId")  REFERENCES "User"("id")    ON DELETE CASCADE,
  CONSTRAINT "Review_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id"                 TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "status"             TEXT        NOT NULL DEFAULT 'INACTIVE',
  "planName"           TEXT        NOT NULL DEFAULT 'STARTER',
  "priceCfa"           INTEGER     NOT NULL,
  "currentPeriodStart" TIMESTAMPTZ NOT NULL,
  "currentPeriodEnd"   TIMESTAMPTZ NOT NULL,
  "geniuspayRef"       TEXT,
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "userId"             TEXT        NOT NULL,
  CONSTRAINT "Subscription_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_userId_key" UNIQUE ("userId"),
  CONSTRAINT "Subscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

CREATE TABLE IF NOT EXISTS "Message" (
  "id"         TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "content"    TEXT        NOT NULL,
  "isRead"     BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "senderId"   TEXT        NOT NULL,
  "receiverId" TEXT        NOT NULL,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Message_senderId_fkey"
    FOREIGN KEY ("senderId")   REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Message_receiverId_fkey"
    FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Message_senderId_idx"   ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "Message_receiverId_idx" ON "Message"("receiverId");

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

INSERT INTO "Category" ("id", "name", "slug", "icon") VALUES
  ('cat_mode',   'Mode & Vêtements',        'mode-vetements',    'Shirt'),
  ('cat_beaute', 'Beauté & Soins',           'beaute-soins',      'Sparkles'),
  ('cat_maison', 'Maison & Décoration',      'maison-decoration', 'Home'),
  ('cat_elec',   'Électronique & High-Tech', 'electronique',      'Cpu'),
  ('cat_sport',  'Sport & Fitness',          'sport-fitness',     'Dumbbell')
ON CONFLICT ("slug") DO NOTHING;
```
