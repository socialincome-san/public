import { SurveySchedule } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
export class SurveyScheduleService extends BaseService {
	async getByProgramIds(programIds: string[]): Promise<ServiceResult<SurveySchedule[]>> {
		try {
			const schedules = await this.db.surveySchedule.findMany({
				where: { programId: { in: programIds } },
				orderBy: { dueInMonthsAfterStart: 'asc' },
			});

			return this.resultOk(schedules);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to get survey schedules for programs: ${error}`);
		}
	}
}
