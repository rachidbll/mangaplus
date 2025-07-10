CREATE TABLE `Manga` (
    `id` VARCHAR(191) NOT NULL,
    `anilistId` INTEGER,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `coverImage` VARCHAR(191) NOT NULL,
    `bannerImage` VARCHAR(191) NOT NULL,
    `genres` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `artist` VARCHAR(191) NOT NULL,
    `totalChapters` INTEGER NOT NULL,
    `rating` DOUBLE NOT NULL,
    `apiMangaName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Manga_anilistId_key`(`anilistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Chapter` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `chapterNumber` INTEGER NOT NULL,
    `pages` JSON NOT NULL,
    `mangaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Chapter` ADD CONSTRAINT `Chapter_mangaId_fkey` FOREIGN KEY (`mangaId`) REFERENCES `Manga`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
