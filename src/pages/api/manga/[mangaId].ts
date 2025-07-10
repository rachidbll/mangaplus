import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { mangaId } = req.query;

  if (req.method === 'GET') {
    const manga = await prisma.manga.findUnique({
      where: { id: mangaId as string },
      include: { chapters: true },
    });
    res.status(200).json(manga);
  } else if (req.method === 'PUT') {
    const { ...data } = req.body;
    const updatedManga = await prisma.manga.update({
      where: { id: mangaId as string },
      data,
    });
    res.status(200).json(updatedManga);
  } else if (req.method === 'DELETE') {
    await prisma.manga.delete({
      where: { id: mangaId as string },
    });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
