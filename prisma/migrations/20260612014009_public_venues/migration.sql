-- CreateEnum
CREATE TYPE "PublicVenueTier" AS ENUM ('FLAGSHIP', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "PublicVenueType" AS ENUM ('LIBRARY', 'CONCERT_HALL', 'GALLERY', 'TEAHOUSE', 'SQUARE', 'COMMUNITY_HALL');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "publicVenueId" TEXT;

-- CreateTable
CREATE TABLE "PublicVenue" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "summary" TEXT,
    "coverUrl" TEXT,
    "tier" "PublicVenueTier" NOT NULL,
    "type" "PublicVenueType" NOT NULL,
    "districtSlug" TEXT NOT NULL,
    "mapX" DOUBLE PRECISION NOT NULL,
    "mapZ" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicVenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueMessage" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicEvent" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicEventRsvp" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicEventRsvp_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateTable
CREATE TABLE "LibraryBook" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'zh',
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "contentPath" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicVenue_slug_key" ON "PublicVenue"("slug");

-- CreateIndex
CREATE INDEX "PublicVenue_slug_idx" ON "PublicVenue"("slug");

-- CreateIndex
CREATE INDEX "PublicVenue_districtSlug_idx" ON "PublicVenue"("districtSlug");

-- CreateIndex
CREATE INDEX "PublicVenue_tier_sortOrder_idx" ON "PublicVenue"("tier", "sortOrder");

-- CreateIndex
CREATE INDEX "VenueMessage_venueId_createdAt_idx" ON "VenueMessage"("venueId", "createdAt");

-- CreateIndex
CREATE INDEX "PublicEvent_venueId_startsAt_idx" ON "PublicEvent"("venueId", "startsAt");

-- CreateIndex
CREATE INDEX "PublicEventRsvp_userId_idx" ON "PublicEventRsvp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBook_slug_key" ON "LibraryBook"("slug");

-- CreateIndex
CREATE INDEX "LibraryBook_venueId_sortOrder_idx" ON "LibraryBook"("venueId", "sortOrder");

-- CreateIndex
CREATE INDEX "Post_publicVenueId_createdAt_idx" ON "Post"("publicVenueId", "createdAt");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_publicVenueId_fkey" FOREIGN KEY ("publicVenueId") REFERENCES "PublicVenue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMessage" ADD CONSTRAINT "VenueMessage_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "PublicVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMessage" ADD CONSTRAINT "VenueMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicEvent" ADD CONSTRAINT "PublicEvent_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "PublicVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicEvent" ADD CONSTRAINT "PublicEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicEventRsvp" ADD CONSTRAINT "PublicEventRsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PublicEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicEventRsvp" ADD CONSTRAINT "PublicEventRsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBook" ADD CONSTRAINT "LibraryBook_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "PublicVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
