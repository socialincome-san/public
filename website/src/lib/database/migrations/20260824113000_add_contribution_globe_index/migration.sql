-- CreateIndex
CREATE INDEX "contribution_status_created_at_idx" ON "contribution"("status", "created_at" DESC);
