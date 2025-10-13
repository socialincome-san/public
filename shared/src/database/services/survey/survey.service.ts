import { ProgramPermission, SurveyStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	SurveyTableView,
	SurveyTableViewRow,
	UpcomingSurveyTableView,
	UpcomingSurveyTableViewRow,
} from './survey.types';

export class SurveyService extends BaseService {
	async getSurveyTableView(userId: string): Promise<ServiceResult<SurveyTableView>> {
		try {
			const surveys = await this.db.survey.findMany({
				where: {
					recipient: {
						program: {
							accesses: { some: { userId } },
						},
					},
				},
				select: {
					id: true,
					questionnaire: true,
					status: true,
					language: true,
					dueAt: true,
					sentAt: true,
					recipient: {
						select: {
							contact: { select: { firstName: true, lastName: true } },
							program: {
								select: {
									id: true,
									name: true,
									accesses: { where: { userId }, select: { permissions: true } },
								},
							},
						},
					},
				},
				orderBy: { dueAt: 'desc' },
			});

			const dateFmt = new Intl.DateTimeFormat('de-CH');

			const tableRows: SurveyTableViewRow[] = surveys.map((s) => {
				const firstName = s.recipient?.contact?.firstName ?? '';
				const lastName = s.recipient?.contact?.lastName ?? '';
				const program = s.recipient?.program;
				const permissions = program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes(ProgramPermission.edit)
					? ProgramPermission.edit
					: ProgramPermission.readonly;

				return {
					id: s.id,
					questionnaire: s.questionnaire,
					status: s.status,
					recipientName: `${firstName} ${lastName}`.trim(),
					language: s.language,
					dueDateAt: s.dueAt,
					dueDateAtFormatted: dateFmt.format(s.dueAt),
					sentAt: s.sentAt,
					sentAtFormatted: s.sentAt ? dateFmt.format(s.sentAt) : null,
					programName: program?.name ?? '',
					programId: program?.id ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
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
			const activeStatuses: SurveyStatus[] = ['new', 'sent', 'scheduled', 'in_progress'];
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const surveys = await this.db.survey.findMany({
				where: {
					recipient: {
						program: {
							accesses: { some: { userId } },
						},
					},
					status: { in: activeStatuses },
					dueAt: { gte: today },
				},
				select: {
					id: true,
					dueAt: true,
					status: true,
					questionnaire: true,
					recipientId: true,
					accessEmail: true,
					accessPw: true,
					recipient: {
						select: {
							contact: { select: { firstName: true, lastName: true } },
							program: {
								select: {
									name: true,
									id: true,
									accesses: { where: { userId }, select: { permissions: true } },
								},
							},
						},
					},
				},
				orderBy: { dueAt: 'asc' },
			});

			const dateFmt = new Intl.DateTimeFormat('de-CH');

			const tableRows: UpcomingSurveyTableViewRow[] = surveys.map((s) => {
				const contact = s.recipient?.contact;
				const program = s.recipient?.program;
				const permissions = program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes(ProgramPermission.edit)
					? ProgramPermission.edit
					: ProgramPermission.readonly;

				return {
					id: s.id,
					firstName: contact?.firstName ?? '',
					lastName: contact?.lastName ?? '',
					questionnaire: s.questionnaire,
					status: s.status,
					dueDateAt: s.dueAt,
					dueDateAtFormatted: dateFmt.format(s.dueAt),
					url: this.buildSurveyUrl({
						surveyId: s.id,
						recipientId: s.recipientId,
						accessEmail: s.accessEmail,
						accessPw: s.accessPw,
					}),
					programName: program?.name ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
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
