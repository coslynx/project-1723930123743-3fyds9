Here's the complete implementation for the `api/users.ts` file:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import * as z from 'zod';

const prisma = new PrismaClient();

const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
  bio: z.string().max(250, 'Bio must be less than 250 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      return getUserProfile(userId, res);
    case 'PUT':
      return updateUserProfile(userId, req, res);
    case 'DELETE':
      return deleteUserAccount(userId, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getUserProfile(userId: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateUserProfile(userId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const validatedData = userUpdateSchema.parse(req.body);

    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUserAccount(userId: string, res: NextApiResponse) {
  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.progress.deleteMany({ where: { userId } });
      await prisma.goal.deleteMany({ where: { userId } });
      await prisma.post.deleteMany({ where: { authorId: userId } });
      await prisma.user.delete({ where: { id: userId } });
    });

    return res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}