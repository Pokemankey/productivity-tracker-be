/*
  Warnings:

  - The values [RUNNING] on the enum `SessionStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `taskId` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SessionStatus_new" AS ENUM ('PLANNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Session" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Session" ALTER COLUMN "status" TYPE "SessionStatus_new" USING ("status"::text::"SessionStatus_new");
ALTER TYPE "SessionStatus" RENAME TO "SessionStatus_old";
ALTER TYPE "SessionStatus_new" RENAME TO "SessionStatus";
DROP TYPE "public"."SessionStatus_old";
ALTER TABLE "Session" ALTER COLUMN "status" SET DEFAULT 'PLANNED';
COMMIT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "taskId" SET NOT NULL,
ALTER COLUMN "startedAt" DROP NOT NULL;
