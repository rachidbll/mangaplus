import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const mangaList = await prisma.manga.findMany({
      include: { chapters: true },
    });
    res.status(200).json(mangaList);
  } else if (req.method === 'POST') {
    const { ...data } = req.body;
    const newManga = await prisma.manga.create({
      data,
    });
    res.status(201).json(newManga);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
