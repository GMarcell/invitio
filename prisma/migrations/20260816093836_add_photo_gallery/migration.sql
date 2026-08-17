-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "showGallery" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL DEFAULT 'host',
    "guestName" TEXT,
    "caption" TEXT,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_objectKey_key" ON "Photo"("objectKey");

-- CreateIndex
CREATE INDEX "Photo_invitationId_idx" ON "Photo"("invitationId");

-- CreateIndex
CREATE INDEX "Photo_createdAt_idx" ON "Photo"("createdAt");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
