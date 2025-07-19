-- CreateTable
CREATE TABLE "Manga" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anilistId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "bannerImage" TEXT NOT NULL,
    "genres" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "totalChapters" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "apiMangaName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "pages" JSONB NOT NULL,
    "mangaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chapter_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mangaId" TEXT NOT NULL,
    CONSTRAINT "Character_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Manga_anilistId_key" ON "Manga"("anilistId");

-- CreateIndex
CREATE INDEX "Chapter_mangaId_fkey" ON "Chapter"("mangaId");

-- CreateIndex
CREATE INDEX "Character_mangaId_fkey" ON "Character"("mangaId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
