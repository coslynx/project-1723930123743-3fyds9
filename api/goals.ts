Here's the complete implementation for the `api/goals.ts` file:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import * as z from 'zod';

const prisma = new PrismaClient();

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  targetDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
  targetValue: z.number().min(0, 'Target value must be positive').max(1000000, 'Target value is too large'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      return getGoals(req, res, userId);
    case 'POST':
      return createGoal(req, res, userId);
    case 'PUT':
      return updateGoal(req, res, userId);
    case 'DELETE':
      return deleteGoal(req, res, userId);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getGoals(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createGoal(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const validatedData = goalSchema.parse(req.body);
    const goal = await prisma.goal.create({
      data: {
        ...validatedData,
        userId,
      },
    });
    return res.status(201).json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating goal:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateGoal(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid goal id' });
  }

  try {
    const validatedData = goalSchema.parse(req.body);
    const existingGoal = await prisma.goal.findUnique({
      where: { id, userId },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: validatedData,
    });

    return res.status(200).json(updatedGoal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating goal:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteGoal(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid goal id' });
  }

  try {
    const existingGoal = await prisma.goal.findUnique({
      where: { id, userId },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.progress.deleteMany({ where: { goalId: id } });
      await prisma.goal.delete({ where: { id } });
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting goal:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}