import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const mangaList = await prisma.manga.findMany({
    include: { chapters: true },
  });
  res.status(200).json(mangaList);
}
