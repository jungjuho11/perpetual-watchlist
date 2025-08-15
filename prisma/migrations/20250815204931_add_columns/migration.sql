/*
  Warnings:

  - Added the required column `title` to the `WatchlistItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."WatchlistItem" ADD COLUMN     "posterImage" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;
