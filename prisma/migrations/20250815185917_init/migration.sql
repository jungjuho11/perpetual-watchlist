-- CreateTable
CREATE TABLE "public"."WatchlistItem" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recommendedBy" TEXT,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);
