-- Add language preference to Admin
ALTER TABLE "Admin" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'ro';

-- Migrate Content table: add locale column and change primary key
ALTER TABLE "Content" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'ro';
ALTER TABLE "Content" DROP CONSTRAINT "Content_pkey";
ALTER TABLE "Content" ADD CONSTRAINT "Content_pkey" PRIMARY KEY ("key", "locale");

-- Create Translation table for UI strings
CREATE TABLE "Translation" (
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("key","locale")
);
