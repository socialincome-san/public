-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'globalAdmin', 'globalAnalyst');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'private');

-- CreateEnum
CREATE TYPE "UserReferralSource" AS ENUM ('familyfriends', 'work', 'socialmedia', 'media', 'presentation', 'other');

-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('en', 'de', 'it', 'fr', 'kri');

-- CreateEnum
CREATE TYPE "RecipientStatus" AS ENUM ('active', 'suspended', 'waitlisted', 'designated', 'former');

-- CreateEnum
CREATE TYPE "ContributionSource" AS ENUM ('benevity', 'cash', 'raisenow', 'stripe', 'wire_transfer');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('failed', 'pending', 'succeeded', 'unknown');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('created', 'paid', 'confirmed', 'contested', 'failed', 'other');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('new', 'sent', 'scheduled', 'in_progress', 'completed', 'missed');

-- CreateEnum
CREATE TYPE "SurveyQuestionnaire" AS ENUM ('onboarding', 'checkin', 'offboarding', 'offboarded_checkin');

-- CreateEnum
CREATE TYPE "RecipientMainLanguage" AS ENUM ('kri', 'en');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "auth_user_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'private',
    "phone" TEXT,
    "company" TEXT,
    "referral" "UserReferralSource",
    "payment_reference_id" TEXT,
    "stripe_customer_id" TEXT,
    "test_user" BOOLEAN NOT NULL DEFAULT false,
    "institution" BOOLEAN NOT NULL DEFAULT false,
    "language" "LanguageCode",
    "currency" TEXT,
    "address_street" TEXT,
    "address_number" TEXT,
    "address_city" TEXT,
    "address_zip" INTEGER,
    "address_country" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "organization_id" TEXT,
    "birth_date" DATE,
    "communication_phone" TEXT,
    "mobile_money_phone" TEXT,
    "has_whatsapp_comm" BOOLEAN,
    "has_whatsapp_mobile" BOOLEAN,
    "whatsapp_activated" BOOLEAN,
    "insta_handle" TEXT,
    "twitter_handle" TEXT,
    "profession" TEXT,
    "calling_name" TEXT,
    "om_uid" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_chf" DOUBLE PRECISION NOT NULL,
    "fees_chf" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "monthly_interval" INTEGER NOT NULL,
    "source" "ContributionSource" NOT NULL,
    "status" "ContributionStatus" NOT NULL,
    "currency" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "raw_content" TEXT,
    "contributor_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "organization_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "contribution_pkey" PRIMARY KEY ("id")
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
    "goal" DOUBLE PRECISION,
    "currency" TEXT,
    "additional_amount_chf" DOUBLE PRECISION,
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
    "organization_id" TEXT,
    "program_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
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
    "duration" INTEGER NOT NULL,
    "viewer_organization_id" TEXT NOT NULL,
    "operator_organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipient" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "local_partner_id" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(3),
    "status" "RecipientStatus" NOT NULL,
    "test_recipient" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "local_partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_chf" DOUBLE PRECISION,
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
CREATE TABLE "payout_forecast" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "month" DATE NOT NULL,
    "number_of_recipients" INTEGER NOT NULL,
    "amount_usd" DOUBLE PRECISION NOT NULL,
    "amount_sle" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payout_forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "questionnaire" "SurveyQuestionnaire" NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "language" "RecipientMainLanguage" NOT NULL,
    "due_date_at" TIMESTAMP(3) NOT NULL,
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
CREATE TABLE "exchange_rate_collection" (
    "id" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "exchange_rate_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rate_item" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "collection_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "exchange_rate_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_certificate" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "storage_path" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "donation_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_user_id_key" ON "user"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contributor_user_id_key" ON "contributor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_name_key" ON "organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "program_name_key" ON "program"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recipient_user_id_key" ON "recipient"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "local_partner_name_key" ON "local_partner"("name");

-- CreateIndex
CREATE UNIQUE INDEX "local_partner_user_id_key" ON "local_partner"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "donation_certificate_user_id_year_key" ON "donation_certificate"("user_id", "year");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor" ADD CONSTRAINT "contributor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_viewer_organization_id_fkey" FOREIGN KEY ("viewer_organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_operator_organization_id_fkey" FOREIGN KEY ("operator_organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_local_partner_id_fkey" FOREIGN KEY ("local_partner_id") REFERENCES "local_partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_partner" ADD CONSTRAINT "local_partner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout" ADD CONSTRAINT "payout_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey" ADD CONSTRAINT "survey_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rate_item" ADD CONSTRAINT "exchange_rate_item_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "exchange_rate_collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_certificate" ADD CONSTRAINT "donation_certificate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
