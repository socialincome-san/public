import { prisma } from '@/lib/database/prisma';
import { connection, NextResponse } from 'next/server';

export const GET = async () => {
	await connection();
	try {
		await prisma.$queryRaw`SELECT 1`;

		return NextResponse.json({ status: 'ok' }, { status: 200 });
	} catch (error) {
		console.error('Healthcheck DB error:', error);

		return NextResponse.json({ status: 'unhealthy' }, { status: 503 });
	}
};
