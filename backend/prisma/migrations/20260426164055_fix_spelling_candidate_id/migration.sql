/*
  Warnings:

  - You are about to drop the column `cadidate_id` on the `CV` table. All the data in the column will be lost.
  - Added the required column `candidate_id` to the `CV` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CV" DROP CONSTRAINT "CV_cadidate_id_fkey";

-- AlterTable
ALTER TABLE "CV" DROP COLUMN "cadidate_id",
ADD COLUMN     "candidate_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CV" ADD CONSTRAINT "CV_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "CANDIDATE"("id") ON DELETE CASCADE ON UPDATE CASCADE;
