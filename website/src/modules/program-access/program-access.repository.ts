import { ProgramPermission } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import type { CreateInitialProgramAccessesInput } from './program-access.types';

export const findActiveOrganizationId = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { activeOrganizationId: true },
	});

	return user?.activeOrganizationId ?? null;
};

export const findProgramAccessesByOrganizationId = async (organizationId: string) =>
	prisma.programAccess.findMany({
		where: { organizationId },
		select: {
			programId: true,
			permission: true,
			program: {
				select: { name: true },
			},
		},
	});

export const createInitialProgramAccesses = async (input: CreateInitialProgramAccessesInput) =>
	prisma.programAccess.createMany({
		data: [
			{
				programId: input.programId,
				organizationId: input.ownerOrganizationId,
				permission: ProgramPermission.owner,
			},
			{
				programId: input.programId,
				organizationId: input.operatorFallbackOrganizationId,
				permission: ProgramPermission.operator,
			},
		],
	});
