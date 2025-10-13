-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'private');

-- CreateEnum
CREATE TYPE "WhatsAppActivationStatus" AS ENUM ('disabled', 'pending', 'verified');

-- CreateEnum
CREATE TYPE "PaymentEventType" AS ENUM ('stripe', 'bank_transfer');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('failed', 'pending', 'succeeded');

-- CreateEnum
CREATE TYPE "RecipientStatus" AS ENUM ('active', 'suspended', 'waitlisted', 'former');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('created', 'paid', 'confirmed', 'contested', 'failed', 'other');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('new', 'sent', 'scheduled', 'in_progress', 'completed', 'missed');

-- CreateEnum
CREATE TYPE "SurveyQuestionnaire" AS ENUM ('onboarding', 'checkin', 'offboarding', 'offboarded_checkin');

-- CreateEnum
CREATE TYPE "ProgramPermission" AS ENUM ('readonly', 'edit');

-- CreateEnum
CREATE TYPE "OrganizationPermission" AS ENUM ('readonly', 'edit');

-- CreateEnum
CREATE TYPE "ContributorReferralSource" AS ENUM ('family_and_friends', 'work', 'social_media', 'media', 'presentation', 'other');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('account_fees', 'administrative', 'delivery_fees', 'donation_fees', 'exchange_rate_loss', 'fundraising_advertising', 'staff');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('orange_money');

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "firebase_auth_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_user" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "portal_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "referral" "ContributorReferralSource" NOT NULL,
    "payment_reference_id" TEXT,
    "stripe_customer_id" TEXT,
    "institution" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "amount_chf" DECIMAL(10,2) NOT NULL,
    "fees_chf" DECIMAL(10,2) NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "status" "ContributionStatus" NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_event" (
    "id" TEXT NOT NULL,
    "contribution_id" TEXT NOT NULL,
    "type" "PaymentEventType" NOT NULL,
    "transaction_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "payment_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_certificate" (
    "id" TEXT NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "storage_path" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "donation_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipient" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(3),
    "status" "RecipientStatus" NOT NULL,
    "successor_name" TEXT,
    "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
    "payment_information_id" TEXT,
    "program_id" TEXT NOT NULL,
    "local_partner_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "amount_chf" DECIMAL(65,30),
    "currency" TEXT NOT NULL,
    "payment_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "PayoutStatus" NOT NULL,
    "phone_number" TEXT,
    "comments" TEXT,
    "message" TEXT,
    "recipient_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "questionnaire" "SurveyQuestionnaire" NOT NULL,
    "language" TEXT NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "SurveyStatus" NOT NULL,
    "comments" TEXT,
    "data" JSONB NOT NULL,
    "access_email" TEXT NOT NULL,
    "access_pw" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "local_partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_access" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "permissions" "OrganizationPermission"[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "organization_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_access" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "permissions" "ProgramPermission"[],

    CONSTRAINT "program_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_payments" INTEGER NOT NULL,
    "payout_amount" DECIMAL(10,2) NOT NULL,
    "payout_currency" TEXT NOT NULL,
    "payout_interval" INTEGER NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Sierra Leone',
    "owner_organization_id" TEXT NOT NULL,
    "operator_organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "second_description_title" TEXT,
    "second_description" TEXT,
    "third_description_title" TEXT,
    "third_description" TEXT,
    "link_website" TEXT,
    "link_instagram" TEXT,
    "link_tiktok" TEXT,
    "link_facebook" TEXT,
    "link_x" TEXT,
    "goal" DECIMAL(10,2),
    "currency" TEXT NOT NULL,
    "additional_amount_chf" DECIMAL(10,2),
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "public" BOOLEAN,
    "featured" BOOLEAN,
    "slug" TEXT,
    "metadata_description" TEXT,
    "metadata_og_image" TEXT,
    "metadata_twitter_image" TEXT,
    "creator_name" TEXT,
    "creator_email" TEXT,
    "organization_id" TEXT NOT NULL,
    "program_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "year" INTEGER NOT NULL,
    "amount_chf" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_information" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "code" TEXT NOT NULL,
    "phone_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "payment_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "calling_name" TEXT,
    "address_id" TEXT,
    "phone_id" TEXT,
    "email" TEXT,
    "gender" "Gender",
    "language" TEXT,
    "date_of_birth" DATE,
    "profession" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'primary',
    "number" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "whats_app" "WhatsAppActivationStatus" NOT NULL DEFAULT 'disabled',
    "updated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rate" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "exchange_rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_firebase_auth_user_id_key" ON "account"("firebase_auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "portal_user_account_id_key" ON "portal_user"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "portal_user_contact_id_key" ON "portal_user"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "contributor_account_id_key" ON "contributor"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "contributor_contact_id_key" ON "contributor"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_event_contribution_id_key" ON "payment_event"("contribution_id");

-- CreateIndex
CREATE UNIQUE INDEX "donation_certificate_contributor_id_year_key" ON "donation_certificate"("contributor_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "recipient_account_id_key" ON "recipient"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipient_contact_id_key" ON "recipient"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "local_partner_contact_id_key" ON "local_partner"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_access_user_id_organizationId_key" ON "organization_access"("user_id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "program_access_user_id_programId_key" ON "program_access"("user_id", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_name_key" ON "organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "program_name_key" ON "program"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_information_code_key" ON "payment_information"("code");

-- CreateIndex
CREATE UNIQUE INDEX "contact_address_id_key" ON "contact"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "phone_number_key" ON "phone"("number");

-- AddForeignKey
ALTER TABLE "portal_user" ADD CONSTRAINT "portal_user_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_user" ADD CONSTRAINT "portal_user_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor" ADD CONSTRAINT "contributor_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor" ADD CONSTRAINT "contributor_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_event" ADD CONSTRAINT "payment_event_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "contribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_certificate" ADD CONSTRAINT "donation_certificate_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_payment_information_id_fkey" FOREIGN KEY ("payment_information_id") REFERENCES "payment_information"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_local_partner_id_fkey" FOREIGN KEY ("local_partner_id") REFERENCES "local_partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout" ADD CONSTRAINT "payout_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey" ADD CONSTRAINT "survey_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_partner" ADD CONSTRAINT "local_partner_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_access" ADD CONSTRAINT "organization_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "portal_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_access" ADD CONSTRAINT "organization_access_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_access" ADD CONSTRAINT "program_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "portal_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_access" ADD CONSTRAINT "program_access_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_operator_organization_id_fkey" FOREIGN KEY ("operator_organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_information" ADD CONSTRAINT "payment_information_phone_id_fkey" FOREIGN KEY ("phone_id") REFERENCES "phone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_phone_id_fkey" FOREIGN KEY ("phone_id") REFERENCES "phone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
