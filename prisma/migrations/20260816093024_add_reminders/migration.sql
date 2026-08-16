-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "enableReminders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderOffsetDays" INTEGER NOT NULL DEFAULT 7;
