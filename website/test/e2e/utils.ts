export const getFirebaseAdminService = async () => {
	const { FirebaseAdminService } = await import('@/lib/services/firebase/firebase-admin.service');
	return new FirebaseAdminService();
};

export const getPrismaClient = async () => {
	const { prisma } = await import('@/lib/database/prisma');
	return prisma;
};
