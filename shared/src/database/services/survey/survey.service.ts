import { Survey as PrismaSurvey } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateSurveyInput } from './survey.types';

export class SurveyService extends BaseService {
	async create(input: CreateSurveyInput): Promise<ServiceResult<PrismaSurvey>> {
		try {
			const survey = await this.db.survey.create({
				data: input,
			});

			return this.resultOk(survey);
		} catch (e) {
			console.error('[SurveyService.create]', e);
			return this.resultFail('Could not create survey');
		}
	}
}
