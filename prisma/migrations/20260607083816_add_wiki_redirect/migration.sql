-- CreateTable
CREATE TABLE "wiki_redirect" (
    "id" TEXT NOT NULL,
    "fromSlug" TEXT NOT NULL,
    "toPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wiki_redirect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wiki_redirect_fromSlug_key" ON "wiki_redirect"("fromSlug");

-- CreateIndex
CREATE INDEX "wiki_redirect_toPageId_idx" ON "wiki_redirect"("toPageId");

-- AddForeignKey
ALTER TABLE "wiki_redirect" ADD CONSTRAINT "wiki_redirect_toPageId_fkey" FOREIGN KEY ("toPageId") REFERENCES "wiki_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
