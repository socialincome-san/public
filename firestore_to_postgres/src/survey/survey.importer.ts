import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class SurveyImporter extends BaseImporter<Prisma.SurveyCreateInput> {
	import = async (surveys: Prisma.SurveyCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const survey of surveys) {
			await prisma.survey.create({ data: survey });
			createdCount++;
		}

		return createdCount;
	};
}
