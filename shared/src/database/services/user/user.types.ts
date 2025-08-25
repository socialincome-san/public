import { User as PrismaUser, UserRole } from '@prisma/client';

export type CreateUserInput = Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'>;

export type UserInformation = {
	firstName: string | null;
	lastName: string | null;
	organizationName: string | null;
	role: UserRole;
};
