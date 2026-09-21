import { prisma } from '@/lib/database/prisma';

export const findContactIdByEmail = async (email: string) =>
	prisma.contact.findUnique({
		where: { email },
		select: { id: true },
	});

export const createSentEmail = async (input: {
	toEmail: string;
	fromEmail: string;
	subject: string;
	body: string;
	contactId: string | null;
}) =>
	prisma.sentEmail.create({
		data: input,
		select: { id: true },
	});
