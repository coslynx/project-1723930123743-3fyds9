import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import * as z from 'zod';

const prisma = new PrismaClient();

const progressSchema = z.object({
  goalId: z.string().uuid(),
  value: z.number().min(0, 'Value must be positive').max(1000000, 'Value is too large'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      return getProgress(req, res, userId);
    case 'POST':
      return addProgress(req, res, userId);
    case 'PUT':
      return updateProgress(req, res, userId);
    case 'DELETE':
      return deleteProgress(req, res, userId);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getProgress(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { goalId } = req.query;

  if (!goalId || typeof goalId !== 'string') {
    return res.status(400).json({ error: 'Invalid goalId' });
  }

  try {
    const progress = await prisma.progress.findMany({
      where: {
        goalId,
        userId,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function addProgress(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const validatedData = progressSchema.parse(req.body);

    const goal = await prisma.goal.findUnique({
      where: {
        id: validatedData.goalId,
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const progress = await prisma.progress.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    return res.status(201).json(progress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error adding progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateProgress(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid progress id' });
  }

  try {
    const validatedData = progressSchema.parse(req.body);

    const existingProgress = await prisma.progress.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!existingProgress) {
      return res.status(404).json({ error: 'Progress entry not found' });
    }

    const updatedProgress = await prisma.progress.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return res.status(200).json(updatedProgress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteProgress(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid progress id' });
  }

  try {
    const existingProgress = await prisma.progress.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!existingProgress) {
      return res.status(404).json({ error: 'Progress entry not found' });
    }

    await prisma.progress.delete({
      where: {
        id,
      },
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}