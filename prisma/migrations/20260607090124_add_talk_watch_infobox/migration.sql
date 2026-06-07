-- AlterTable
ALTER TABLE "wiki_page" ADD COLUMN     "infobox" JSONB;

-- CreateTable
CREATE TABLE "talk_message" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "authorId" TEXT,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talk_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch" (
    "userId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_pkey" PRIMARY KEY ("userId","pageId")
);

-- CreateIndex
CREATE INDEX "talk_message_pageId_createdAt_idx" ON "talk_message"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "talk_message_parentId_idx" ON "talk_message"("parentId");

-- CreateIndex
CREATE INDEX "watch_pageId_idx" ON "watch"("pageId");

-- AddForeignKey
ALTER TABLE "talk_message" ADD CONSTRAINT "talk_message_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "wiki_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talk_message" ADD CONSTRAINT "talk_message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talk_message" ADD CONSTRAINT "talk_message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "talk_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch" ADD CONSTRAINT "watch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch" ADD CONSTRAINT "watch_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "wiki_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
