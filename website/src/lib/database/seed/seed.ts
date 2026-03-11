import { prisma } from '../prisma';
import { seedDatabase } from './run-seed';

const main = async () => {
	try {
		await seedDatabase();
		console.info('✅ Seed completed');
	} catch (error) {
		console.error('❌ Seed failed', error);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
	}
};

void main();
