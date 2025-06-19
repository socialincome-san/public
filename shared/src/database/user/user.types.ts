import { User as PrismaUser } from '@prisma/client';

export type CreateUserInput = Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'>;
