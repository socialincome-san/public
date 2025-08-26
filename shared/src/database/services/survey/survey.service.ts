import { Survey as PrismaSurvey } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	CreateSurveyInput,
	ProgramPermission,
	SurveyTableView,
	SurveyTableViewRow,
	UpcomingSurveyTableView,
	UpcomingSurveyTableViewRow,
} from './survey.types';

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

	async getUpcomingSurveysTableView(userId: string): Promise<ServiceResult<UpcomingSurveyTableView>> {
		try {
			const activeStatuses = ['new', 'sent', 'scheduled', 'in_progress'];
			const startOfToday = new Date();
			startOfToday.setHours(0, 0, 0, 0);

			const surveys = await this.db.survey.findMany({
				where: {
					program: this.userAccessibleProgramsWhere(userId),
					status: { in: activeStatuses as any },
					dueDateAt: { gte: startOfToday },
				},
				select: {
					id: true,
					recipientId: true,
					questionnaire: true,
					status: true,
					dueDateAt: true,
					accessEmail: true,
					accessPw: true,
					recipient: { select: { user: { select: { firstName: true, lastName: true } } } },
					program: {
						select: {
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
				orderBy: { dueDateAt: 'asc' },
			});

			const tableRows: UpcomingSurveyTableViewRow[] = surveys.map((survey) => {
				const firstName = survey.recipient?.user?.firstName ?? '';
				const lastName = survey.recipient?.user?.lastName ?? '';

				const isOperator = (survey.program?.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = isOperator ? 'operator' : 'viewer';

				return {
					id: survey.id,
					firstName,
					lastName,
					questionnaire: survey.questionnaire,
					status: survey.status,
					dueDateAt: survey.dueDateAt,
					dueDateAtFormatted: new Intl.DateTimeFormat('de-CH').format(survey.dueDateAt),
					url: this.buildSurveyUrl({
						surveyId: survey.id,
						recipientId: survey.recipientId,
						accessEmail: survey.accessEmail,
						accessPw: survey.accessPw,
					}),
					programName: survey.program?.name ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[SurveyService.getUpcomingSurveysTableView]', error);
			return this.resultFail('Could not fetch upcoming surveys');
		}
	}

	private buildSurveyUrl({
		surveyId,
		recipientId,
		accessEmail,
		accessPw,
	}: {
		surveyId: string;
		recipientId: string;
		accessEmail: string;
		accessPw: string;
	}): string {
		const base = (process.env.BASE_URL ?? '').replace(/\/+$/, '');
		const url = new URL([base, 'survey', recipientId, surveyId].join('/'));
		url.search = new URLSearchParams({ email: accessEmail, pw: accessPw }).toString();
		return url.toString();
	}
}
