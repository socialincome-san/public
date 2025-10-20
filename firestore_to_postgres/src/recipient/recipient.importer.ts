import { Prisma, PrismaClient } from '@prisma/client';
import { DEFAULT_PROGRAM } from '../../scripts/seed-defaults';
import { BaseImporter } from '../core/base.importer';
import { RecipientCreateInput } from './recipient.types';

const prisma = new PrismaClient();

export class RecipientImporter extends BaseImporter<RecipientCreateInput> {
	import = async (recipients: RecipientCreateInput[]): Promise<number> => {
		let createdCount = 0;
		let duplicateEmails = 0;
		let duplicateCodes = 0;

		const program = await prisma.program.findUnique({
			where: { name: DEFAULT_PROGRAM.name },
		});

		if (!program) {
			throw new Error(`[RecipientImporter] Default program "${DEFAULT_PROGRAM.name}" not found.`);
		}

		for (const data of recipients) {
			const email = data.contact?.create?.email ?? 'unknown';
			const { emailAttempts, codeAttempts } = await this.createRecipientWithUniqueFields(data, email, program.id);
			createdCount++;
			duplicateEmails += emailAttempts;
			duplicateCodes += codeAttempts;
		}

		if (duplicateEmails > 0 || duplicateCodes > 0) {
			console.log(
				`⚠️ RecipientImporter summary: handled ${duplicateEmails} duplicate email(s) and ${duplicateCodes} duplicate code(s).`,
			);
		}

		return createdCount;
	};

	private async createRecipientWithUniqueFields(
		data: RecipientCreateInput,
		baseEmail: string,
		programId: string,
	): Promise<{ emailAttempts: number; codeAttempts: number }> {
		let email = baseEmail;
		let emailAttempts = 0;
		let codeAttempts = 0;

		while (true) {
			try {
				await prisma.recipient.create({
					data: {
						...data,
						program: { connect: { id: programId } },
					},
				});
				return { emailAttempts, codeAttempts };
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
					const targets = (error.meta?.target as string[]) ?? [];

					if (targets.includes('email')) {
						emailAttempts++;
						email = `${baseEmail}-UNIQUE-${emailAttempts}`;
						data.contact!.create!.email = email;
						continue;
					}

					if (targets.includes('code')) {
						if (process.env.FIREBASE_DATABASE_URL?.includes('staging')) {
							codeAttempts++;
							const baseCode = data.paymentInformation?.create?.code ?? 'missing_code';
							const newCode = `${baseCode}-UNIQUE-${codeAttempts}`;
							if (data.paymentInformation?.create) {
								data.paymentInformation.create.code = newCode;
							}
							console.log(`💡 Duplicate paymentInformation.code (staging only) → adjusted to ${newCode}`);
							continue;
						}
						throw new Error(
							`Duplicate paymentInformation.code "${data.paymentInformation?.create?.code}" detected in production.`,
						);
					}
				}

				throw error;
			}
		}
	}
}
