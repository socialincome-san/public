import { ProgramPermission } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';

export const findActiveOrganizationId = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { activeOrganizationId: true },
	});
	const activeOrganizationId = user?.activeOrganizationId ?? null;
	if (!activeOrganizationId) {
		return null;
	}

	const access = await prisma.organizationAccess.findUnique({
		where: {
			userId_organizationId: {
				userId,
				organizationId: activeOrganizationId,
			},
		},
		select: { organizationId: true },
	});

	return access?.organizationId ?? null;
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

export const findOperatorProgramCountriesByUserId = async (userId: string) =>
	prisma.programAccess.findMany({
		where: {
			permission: ProgramPermission.operator,
			organization: { organizationAccesses: { some: { userId } } },
		},
		select: {
			program: {
				select: {
					country: { select: { isoCode: true } },
				},
			},
		},
	});
