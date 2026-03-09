export const getFirebaseAdminService = async () => {
	const { FirebaseAdminService } = await import('@/lib/services/firebase/firebase-admin.service');
	const { prisma } = await import('@/lib/database/prisma');
	return new FirebaseAdminService(prisma);
};

export const getPrismaClient = async () => {
	const { prisma } = await import('@/lib/database/prisma');
	return prisma;
};
