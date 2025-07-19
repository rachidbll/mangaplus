import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 80; // Default to 80 if CapRover doesn't inject PORT

// Global error handling for uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1); // Mandatory exit after uncaught exception
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason, promise);
  // Optionally, you might want to exit here for unhandled rejections in production
  // process.exit(1);
});

// Test database connection on startup
async function connectToDatabase() {
  const MAX_RETRIES = 5;
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      await prisma.$connect();
      console.log('Database connected successfully!');
      return;
    } catch (error) {
      retries++;
      console.error(`Failed to connect to database (attempt ${retries}/${MAX_RETRIES}):`, error);
      console.error('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/^(.*?:\/\/.*?):.*?@/, '$1:*****@') : 'Not set');
      if (retries < MAX_RETRIES) {
        console.log('Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  console.error('Failed to connect to database after multiple retries. Exiting.');
  process.exit(1); // Exit if database connection fails after all retries
}
connectToDatabase();

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

// Settings API
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.status(200).json(settingsMap);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/settings', async (req, res) => {
  const { settings } = req.body;
  try {
    for (const { key, value } of settings) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Serve static files from the 'dist' directory (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));
console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);

// All other GET requests should return the index.html (for client-side routing)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`Attempting to serve index.html from: ${indexPath}`);
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});