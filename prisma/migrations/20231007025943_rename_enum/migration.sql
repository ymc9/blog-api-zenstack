/*
  Warnings:

  - The values [USER] on the enum `SpaceUserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SpaceUserRole_new" AS ENUM ('MEMBER', 'ADMIN');
ALTER TABLE "SpaceUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "SpaceUser" ALTER COLUMN "role" TYPE "SpaceUserRole_new" USING ("role"::text::"SpaceUserRole_new");
ALTER TYPE "SpaceUserRole" RENAME TO "SpaceUserRole_old";
ALTER TYPE "SpaceUserRole_new" RENAME TO "SpaceUserRole";
DROP TYPE "SpaceUserRole_old";
ALTER TABLE "SpaceUser" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterTable
ALTER TABLE "SpaceUser" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
