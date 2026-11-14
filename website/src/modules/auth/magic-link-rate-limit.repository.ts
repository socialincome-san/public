import { prisma } from '@/lib/database/prisma';

export const deleteExpiredMagicLinkRateLimits = async (before: Date) =>
	prisma.magicLinkRateLimit.deleteMany({
		where: { windowStartedAt: { lt: before } },
	});

export const updateMagicLinkRateLimitCount = async (keyHash: string, now: Date, windowMs: number): Promise<number> => {
	await prisma.magicLinkRateLimit.upsert({
		where: { keyHash },
		create: { keyHash, windowStartedAt: now, requestCount: 0 },
		update: {},
		select: { keyHash: true },
	});

	const reset = await prisma.magicLinkRateLimit.updateMany({
		where: {
			keyHash,
			windowStartedAt: { lte: new Date(now.getTime() - windowMs) },
		},
		data: { windowStartedAt: now, requestCount: 1 },
	});
	if (reset.count > 0) {
		return 1;
	}

	const updated = await prisma.magicLinkRateLimit.update({
		where: { keyHash },
		data: { requestCount: { increment: 1 } },
		select: { requestCount: true },
	});

	return updated.requestCount;
};
