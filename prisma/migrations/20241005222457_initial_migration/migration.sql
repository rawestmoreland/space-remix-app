-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "aplha_2_code" TEXT NOT NULL,
    "alpha_3_code" TEXT NOT NULL,
    "nationality_name" TEXT NOT NULL,
    "nationality_name_composed" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MissionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Launch" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "net" TIMESTAMP(3) NOT NULL,
    "netPrecisionId" INTEGER,
    "imageId" INTEGER,
    "statusId" INTEGER NOT NULL,

    CONSTRAINT "Launch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LauncherConfiguration" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "info_url" TEXT NOT NULL,
    "wiki_url" TEXT NOT NULL,
    "imageId" INTEGER,
    "active" BOOLEAN NOT NULL,
    "programId" INTEGER,

    CONSTRAINT "LauncherConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "credit" TEXT,
    "single_use" BOOLEAN,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "info_url" TEXT,
    "wiki_url" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "imageId" INTEGER,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProgramType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageId" INTEGER,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbrev" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "LaunchStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetPrecision" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbrev" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "NetPrecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionPatch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "agencyId" INTEGER,

    CONSTRAINT "MissionPatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "abbrev" TEXT NOT NULL,
    "agencyTypeId" INTEGER,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AgencyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProgramToProgramType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MissionPatchToProgram" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AgencyToMission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProgramToProgramType_AB_unique" ON "_ProgramToProgramType"("A", "B");

-- CreateIndex
CREATE INDEX "_ProgramToProgramType_B_index" ON "_ProgramToProgramType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MissionPatchToProgram_AB_unique" ON "_MissionPatchToProgram"("A", "B");

-- CreateIndex
CREATE INDEX "_MissionPatchToProgram_B_index" ON "_MissionPatchToProgram"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgencyToMission_AB_unique" ON "_AgencyToMission"("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToMission_B_index" ON "_AgencyToMission"("B");

-- AddForeignKey
ALTER TABLE "Launch" ADD CONSTRAINT "Launch_netPrecisionId_fkey" FOREIGN KEY ("netPrecisionId") REFERENCES "NetPrecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Launch" ADD CONSTRAINT "Launch_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Launch" ADD CONSTRAINT "Launch_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "LaunchStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LauncherConfiguration" ADD CONSTRAINT "LauncherConfiguration_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LauncherConfiguration" ADD CONSTRAINT "LauncherConfiguration_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionPatch" ADD CONSTRAINT "MissionPatch_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_agencyTypeId_fkey" FOREIGN KEY ("agencyTypeId") REFERENCES "AgencyType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramToProgramType" ADD CONSTRAINT "_ProgramToProgramType_A_fkey" FOREIGN KEY ("A") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramToProgramType" ADD CONSTRAINT "_ProgramToProgramType_B_fkey" FOREIGN KEY ("B") REFERENCES "ProgramType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MissionPatchToProgram" ADD CONSTRAINT "_MissionPatchToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "MissionPatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MissionPatchToProgram" ADD CONSTRAINT "_MissionPatchToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToMission" ADD CONSTRAINT "_AgencyToMission_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToMission" ADD CONSTRAINT "_AgencyToMission_B_fkey" FOREIGN KEY ("B") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
