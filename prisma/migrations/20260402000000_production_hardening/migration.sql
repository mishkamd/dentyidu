-- Production Hardening Migration
-- Adds indexes, converts Float to Decimal for currency, fixes cascade behavior, adds unique constraint

-- =============================================
-- 1. INDEXES
-- =============================================

-- Lead indexes
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_country_idx" ON "Lead"("country");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- Admin indexes
CREATE INDEX "Admin_clinicId_idx" ON "Admin"("clinicId");
CREATE INDEX "Admin_role_idx" ON "Admin"("role");
CREATE INDEX "Admin_active_idx" ON "Admin"("active");

-- Patient indexes
CREATE INDEX "Patient_clinicId_idx" ON "Patient"("clinicId");
CREATE INDEX "Patient_status_idx" ON "Patient"("status");
CREATE INDEX "Patient_createdAt_idx" ON "Patient"("createdAt");

-- Message indexes
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- Notification indexes
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- Invoice indexes
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

-- AuditLog indexes
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");
CREATE INDEX "AuditLog_leadId_idx" ON "AuditLog"("leadId");

-- =============================================
-- 2. FLOAT → DECIMAL CONVERSION (currency fields)
-- =============================================

-- Service.price
ALTER TABLE "Service" ALTER COLUMN "price" TYPE DECIMAL(10,2);

-- Offer.total
ALTER TABLE "Offer" ALTER COLUMN "total" TYPE DECIMAL(10,2);

-- OfferItem.unitPrice, total
ALTER TABLE "OfferItem" ALTER COLUMN "unitPrice" TYPE DECIMAL(10,2);
ALTER TABLE "OfferItem" ALTER COLUMN "total" TYPE DECIMAL(10,2);

-- Invoice.total, paidAmount
ALTER TABLE "Invoice" ALTER COLUMN "total" TYPE DECIMAL(10,2);
ALTER TABLE "Invoice" ALTER COLUMN "paidAmount" TYPE DECIMAL(10,2);

-- InvoiceItem.unitPrice, total
ALTER TABLE "InvoiceItem" ALTER COLUMN "unitPrice" TYPE DECIMAL(10,2);
ALTER TABLE "InvoiceItem" ALTER COLUMN "total" TYPE DECIMAL(10,2);

-- InvoiceSettings.tvaRate
ALTER TABLE "InvoiceSettings" ALTER COLUMN "tvaRate" TYPE DECIMAL(5,2);

-- =============================================
-- 3. CASCADE / SET NULL FIXES
-- =============================================

-- Admin.clinic → onDelete: SetNull
ALTER TABLE "Admin" DROP CONSTRAINT IF EXISTS "Admin_clinicId_fkey";
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_clinicId_fkey"
  FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AuditLog.admin → onDelete: SetNull
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_adminId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AuditLog.lead → onDelete: SetNull
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_leadId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================
-- 4. UNIQUE CONSTRAINTS
-- =============================================

-- InvoiceSettings.language must be unique (one template per language)
ALTER TABLE "InvoiceSettings" ADD CONSTRAINT "InvoiceSettings_language_key" UNIQUE ("language");
