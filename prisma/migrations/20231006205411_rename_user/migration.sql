/*
 Warnings:
 
 - You are about to drop the column `userId` on the `Post` table. All the data in the column will be lost.
 
 */
-- DropForeignKey
ALTER TABLE
  "Post" DROP CONSTRAINT "Post_userId_fkey";

-- AlterTable
ALTER TABLE
  "Post" DROP COLUMN "userId",
ADD
  COLUMN "ownerId" INTEGER;

-- AddForeignKey
ALTER TABLE
  "Post"
ADD
  CONSTRAINT "Post_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;