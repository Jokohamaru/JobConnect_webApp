-- CreateEnum
CREATE TYPE "User_role" AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');

-- CreateEnum
CREATE TYPE "User_status" AS ENUM ('ACTIVE', 'PENDING', 'BANNED', 'DELETED');

-- CreateEnum
CREATE TYPE "Job_status" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CV_status" AS ENUM ('DONE', 'DRAFT', 'DELETED');

-- CreateEnum
CREATE TYPE "Application_status" AS ENUM ('APPLIED', 'REVIEWING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "hash_password" VARCHAR(255) NOT NULL,
    "ava_url" TEXT,
    "status" "User_status" NOT NULL DEFAULT 'ACTIVE',
    "role" "User_role" NOT NULL DEFAULT 'CANDIDATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CANDIDATE" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(20) NOT NULL,
    "phone_number" VARCHAR(10),
    "career_role" VARCHAR(100),

    CONSTRAINT "CANDIDATE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruiter" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(20) NOT NULL,
    "phone_number" VARCHAR(10),

    CONSTRAINT "Recruiter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "Company_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TAG" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "TAG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement_skill" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Requirement_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "recruiter_id" INTEGER NOT NULL,
    "salary_rangename" VARCHAR(100),
    "company_type" INTEGER NOT NULL,
    "company_size" VARCHAR(20),
    "nation" VARCHAR(100),
    "description" TEXT,
    "address" VARCHAR(200),
    "logo_url" VARCHAR(100),
    "official_website_url" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "title" VARCHAR(20) NOT NULL,
    "status" "Job_status" NOT NULL DEFAULT 'DRAFT',
    "Location" INTEGER NOT NULL,
    "salary_range" VARCHAR(20),
    "number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CV" (
    "id" SERIAL NOT NULL,
    "cadidate_id" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "CV_url" VARCHAR(100) NOT NULL,
    "status" "CV_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APPLICATION" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "CV_id" INTEGER NOT NULL,
    "status" "Application_status" NOT NULL DEFAULT 'APPLIED',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APPLICATION_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobToRequirementSkill" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_JobToRequirementSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JobToTAG" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_JobToTAG_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_user_id_key" ON "Admin"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CANDIDATE_user_id_key" ON "CANDIDATE"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Recruiter_user_id_key" ON "Recruiter"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Company_recruiter_id_key" ON "Company"("recruiter_id");

-- CreateIndex
CREATE INDEX "_JobToRequirementSkill_B_index" ON "_JobToRequirementSkill"("B");

-- CreateIndex
CREATE INDEX "_JobToTAG_B_index" ON "_JobToTAG"("B");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CANDIDATE" ADD CONSTRAINT "CANDIDATE_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruiter" ADD CONSTRAINT "Recruiter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "Recruiter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_company_type_fkey" FOREIGN KEY ("company_type") REFERENCES "Company_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_Location_fkey" FOREIGN KEY ("Location") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CV" ADD CONSTRAINT "CV_cadidate_id_fkey" FOREIGN KEY ("cadidate_id") REFERENCES "CANDIDATE"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APPLICATION" ADD CONSTRAINT "APPLICATION_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APPLICATION" ADD CONSTRAINT "APPLICATION_CV_id_fkey" FOREIGN KEY ("CV_id") REFERENCES "CV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToRequirementSkill" ADD CONSTRAINT "_JobToRequirementSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToRequirementSkill" ADD CONSTRAINT "_JobToRequirementSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "Requirement_skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToTAG" ADD CONSTRAINT "_JobToTAG_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToTAG" ADD CONSTRAINT "_JobToTAG_B_fkey" FOREIGN KEY ("B") REFERENCES "TAG"("id") ON DELETE CASCADE ON UPDATE CASCADE;
