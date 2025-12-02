/*
  Warnings:

  - You are about to drop the column `userID` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `userId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userID_fkey";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "userID",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
