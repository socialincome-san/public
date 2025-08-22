import { Survey as PrismaSurvey } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateSurveyInput, ProgramPermission, SurveyTableView, SurveyTableViewRow } from './survey.types';

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

	async getSurveyTableView(userId: string): Promise<ServiceResult<SurveyTableView>> {
		try {
			const surveys = await this.db.survey.findMany({
				where: {
					program: this.userAccessibleProgramsWhere(userId),
				},
				select: {
					id: true,
					questionnaire: true,
					status: true,
					recipientName: true,
					language: true,
					dueDateAt: true,
					sentAt: true,
					program: {
						select: {
							id: true,
							name: true,
							operatorOrganization: {
								select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
							},
							viewerOrganization: {
								select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
							},
						},
					},
				},
				orderBy: { dueDateAt: 'desc' },
			});

			const swissGermanDate = new Intl.DateTimeFormat('de-CH');

			const tableRows: SurveyTableViewRow[] = surveys.map((survey) => {
				const canOperateOnProgram = (survey.program?.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = canOperateOnProgram ? 'operator' : 'viewer';

				return {
					id: survey.id,
					questionnaire: survey.questionnaire,
					status: survey.status,
					recipientName: survey.recipientName,
					language: survey.language,
					dueDateAt: survey.dueDateAt,
					dueDateAtFormatted: swissGermanDate.format(survey.dueDateAt),
					sentAt: survey.sentAt ?? null,
					sentAtFormatted: survey.sentAt ? swissGermanDate.format(survey.sentAt) : null,
					programName: survey.program?.name ?? '',
					programId: survey.program?.id ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[SurveyService.getSurveyTableView]', error);
			return this.resultFail('Could not fetch surveys');
		}
	}

	async getSurveyTableViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<SurveyTableView>> {
		const base = await this.getSurveyTableView(userId);
		if (!base.success) return base;

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
	}
}
