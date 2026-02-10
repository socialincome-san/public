import { seedDatabase } from './run-seed';
import { prisma } from '../prisma';

async function main() {
	try {
		await seedDatabase();
		console.log('✅ Seed completed');
	} catch (error) {
		console.error('❌ Seed failed', error);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
	}
}

main();