/*
  Warnings:

  - You are about to drop the column `chainId` on the `votes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "votes" DROP COLUMN "chainId",
ALTER COLUMN "num_votes" SET DATA TYPE TEXT;
