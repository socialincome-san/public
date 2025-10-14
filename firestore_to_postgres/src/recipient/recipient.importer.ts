import { PrismaClient } from '@prisma/client';
import { DEFAULT_ORGANIZATION, DEFAULT_PROGRAM } from '../../scripts/seed-defaults';
import { BaseImporter } from '../core/base.importer';
import { RecipientCreateInput } from './recipient.types';

const prisma = new PrismaClient();

export class RecipientImporter extends BaseImporter<RecipientCreateInput> {
	import = async (recipients: RecipientCreateInput[]): Promise<number> => {
		let createdCount = 0;

		const organization = await prisma.organization.findUnique({
			where: { name: DEFAULT_ORGANIZATION.name },
		});

		const program = await prisma.program.findUnique({
			where: { name: DEFAULT_PROGRAM.name },
		});

		if (!organization || !program) return 0;

		for (const data of recipients) {
			try {
				await prisma.recipient.create({
					data: {
						...data,
						program: { connect: { id: program.id } },
					},
				});
				createdCount++;
			} catch (error) {
				console.error('[RecipientImporter] Failed to import recipient:', error);
			}
		}

		return createdCount;
	};
}
