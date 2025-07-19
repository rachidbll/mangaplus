import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4173;

app.use(cors());
app.use(express.json());

// API routes
app.get('/api/manga', async (req, res) => {
  try {
    const mangaList = await prisma.manga.findMany({
      include: { chapters: true },
    });
    res.status(200).json(mangaList);
  } catch (error) {
    console.error('Error fetching manga list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/manga', async (req, res) => {
  try {
    const newManga = await prisma.manga.create({
      data: req.body,
    });
    res.status(201).json(newManga);
  } catch (error) {
    console.error('Error creating new manga:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/manga/all', async (req, res) => {
  try {
    const mangaList = await prisma.manga.findMany({
      include: { chapters: true },
    });
    res.status(200).json(mangaList);
  } catch (error) {
    console.error('Error fetching all manga:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/manga/:mangaId', async (req, res) => {
  const { mangaId } = req.params;
  try {
    const manga = await prisma.manga.findUnique({
      where: { id: mangaId },
      include: { chapters: true },
    });
    if (manga) {
      res.status(200).json(manga);
    } else {
      res.status(404).json({ error: 'Manga not found' });
    }
  } catch (error) {
    console.error(`Error fetching manga with ID ${mangaId}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/manga/:mangaId', async (req, res) => {
  const { mangaId } = req.params;
  try {
    const updatedManga = await prisma.manga.update({
      where: { id: mangaId },
      data: req.body,
    });
    res.status(200).json(updatedManga);
  } catch (error) {
    console.error(`Error updating manga with ID ${mangaId}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/manga/:mangaId', async (req, res) => {
  const { mangaId } = req.params;
  try {
    await prisma.manga.delete({
      where: { id: mangaId },
    });
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting manga with ID ${mangaId}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static files from the 'dist' directory (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// All other GET requests should return the index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});