import { Program as PrismaProgram } from '@prisma/client';

export type CreateProgramInput = Omit<PrismaProgram, 'id' | 'createdAt' | 'updatedAt'>;
