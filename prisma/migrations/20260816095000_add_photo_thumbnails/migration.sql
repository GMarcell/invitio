-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "thumbObjectKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Photo_thumbObjectKey_key" ON "Photo"("thumbObjectKey");
