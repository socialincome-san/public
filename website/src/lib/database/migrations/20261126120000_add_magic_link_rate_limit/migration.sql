-- CreateTable
CREATE TABLE "magic_link_rate_limit" (
    "id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "window_started_at" TIMESTAMPTZ(3) NOT NULL,
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "magic_link_rate_limit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_rate_limit_key_hash_key" ON "magic_link_rate_limit"("key_hash");

-- CreateIndex
CREATE INDEX "magic_link_rate_limit_window_started_at_idx" ON "magic_link_rate_limit"("window_started_at");
