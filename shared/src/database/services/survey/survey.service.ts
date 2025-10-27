import { ProgramPermission } from '@prisma/client';
import { isFuture } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessService } from '../program-access/program-access.service';
import { SurveyTableView, SurveyTableViewRow } from './survey.types';

export class SurveyService extends BaseService {
	private programAccessService = new ProgramAccessService();

	async getTableView(userId: string): Promise<ServiceResult<SurveyTableView>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const accessiblePrograms = accessibleProgramsResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);
			const surveys = await this.db.survey.findMany({
				where: { recipient: { programId: { in: programIds } } },
				select: {
					id: true,
					questionnaire: true,
					status: true,
					language: true,
					dueAt: true,
					completedAt: true,
					createdAt: true,
					accessEmail: true,
					accessPw: true,
					recipient: {
						select: {
							id: true,
							contact: { select: { firstName: true, lastName: true } },
							program: { select: { id: true, name: true } },
						},
					},
				},
				orderBy: { dueAt: 'desc' },
			});

			const tableRows: SurveyTableViewRow[] = surveys.map((survey) => {
				const programId = survey.recipient.program.id;
				const access = accessiblePrograms.find((p) => p.programId === programId);
				const permission = access?.permission ?? ProgramPermission.readonly;

				return {
					id: survey.id,
					recipientName:
						`${survey.recipient.contact?.firstName ?? ''} ${survey.recipient.contact?.lastName ?? ''}`.trim(),
					programId,
					programName: survey.recipient.program.name,
					questionnaire: survey.questionnaire,
					status: survey.status,
					language: survey.language,
					dueAt: survey.dueAt,
					completedAt: survey.completedAt,
					createdAt: survey.createdAt,
					surveyUrl: this.buildSurveyUrl({
						surveyId: survey.id,
						recipientId: survey.recipient.id,
						accessEmail: survey.accessEmail,
						accessPw: survey.accessPw,
					}),
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch surveys');
		}
	}

	async getUpcomingSurveyTableView(userId: string): Promise<ServiceResult<SurveyTableView>> {
		try {
			const allSurveysResult = await this.getTableView(userId);
			if (!allSurveysResult.success) {
				return allSurveysResult;
			}

			const upcoming = allSurveysResult.data.tableRows.filter((row) => isFuture(row.dueAt));

			return this.resultOk({ tableRows: upcoming });
		} catch {
			return this.resultFail('Could not fetch upcoming surveys');
		}
	}

	async getTableViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<SurveyTableView>> {
		const base = await this.getTableView(userId);
		if (!base.success) {
			return base;
		}

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
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
