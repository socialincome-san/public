import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class SurveyImporter extends BaseImporter<Prisma.SurveyCreateInput> {
	import = async (surveys: Prisma.SurveyCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const survey of surveys) {
			try {
				const recipientLegacyId =
					'recipient' in survey
						? (survey.recipient as { connect: { legacyFirestoreId: string } }).connect.legacyFirestoreId
						: undefined;

				if (recipientLegacyId) {
					const exists = await prisma.recipient.findUnique({
						where: { legacyFirestoreId: recipientLegacyId },
					});
					if (!exists) continue;
				}

				await prisma.survey.create({ data: survey });
				createdCount++;
			} catch (error) {
				const id = (survey.legacyFirestoreId as string) ?? 'unknown';
				const message = error instanceof Error ? error.message : 'Unknown error';
				console.error(`[SurveyImporter] Failed to import survey ${id}: ${message}`);
			}
		}

		return createdCount;
	};
}
