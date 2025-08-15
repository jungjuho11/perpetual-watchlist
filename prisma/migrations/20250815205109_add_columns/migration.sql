-- AlterTable
ALTER TABLE "public"."WatchlistItem" ALTER COLUMN "favorite" SET DEFAULT false,
ALTER COLUMN "title" DROP NOT NULL;
