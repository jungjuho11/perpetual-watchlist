/*
  Warnings:

  - Added the required column `favorite` to the `WatchlistItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."WatchlistItem" ADD COLUMN     "dateWatched" TIMESTAMP(3),
ADD COLUMN     "favorite" BOOLEAN NOT NULL,
ADD COLUMN     "priority" INTEGER,
ADD COLUMN     "userRating" INTEGER;
