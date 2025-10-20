import { Prisma, PrismaClient } from '@prisma/client';
import { DEFAULT_PROGRAM } from '../../scripts/seed-defaults';
import { BaseImporter } from '../core/base.importer';
import { RecipientCreateInput } from './recipient.types';

const prisma = new PrismaClient();

export class RecipientImporter extends BaseImporter<RecipientCreateInput> {
	import = async (recipients: RecipientCreateInput[]): Promise<number> => {
		let createdCount = 0;
		let duplicateEmails = 0;

		const program = await prisma.program.findUnique({
			where: { name: DEFAULT_PROGRAM.name },
		});

		if (!program) {
			throw new Error(`[RecipientImporter] Default program "${DEFAULT_PROGRAM.name}" not found.`);
		}

		for (const data of recipients) {
			const email = data.contact?.create?.email ?? 'unknown';
			const attempts = await this.createRecipientWithUniqueEmail(data, email, program.id);
			createdCount++;
			duplicateEmails += attempts;
		}

		if (duplicateEmails > 0) {
			console.log(`⚠️ RecipientImporter: handled ${duplicateEmails} duplicate email(s).`);
		}

		return createdCount;
	};

	/**
	 * Creates a recipient while ensuring unique email by appending "-UNIQUE-n"
	 * suffixes when duplicates occur.
	 */
	private async createRecipientWithUniqueEmail(
		data: RecipientCreateInput,
		baseEmail: string,
		programId: string,
	): Promise<number> {
		let email = baseEmail;
		let attempts = 0;

		while (true) {
			try {
				await prisma.recipient.create({
					data: {
						...data,
						program: { connect: { id: programId } },
					},
				});
				return attempts;
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
					const targets = (error.meta?.target as string[]) ?? [];

					if (targets.includes('email')) {
						attempts++;
						email = `${baseEmail}-UNIQUE-${attempts}`;
						data.contact!.create!.email = email;
						continue;
					}
				}

				throw error;
			}
		}
	}
}
