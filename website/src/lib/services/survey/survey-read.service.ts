import { Prisma, ProgramPermission, SurveyStatus } from '@/generated/prisma/client';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import crypto from 'crypto';
import { addMonths, endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { RecipientReadService } from '../recipient/recipient-read.service';
import { SurveyScheduleService } from '../survey-schedule/survey-schedule.service';
import {
	SurveyCreateInput,
	SurveyGenerationPreviewResult,
	SurveyPaginatedTableView,
	SurveyPayload,
	SurveyTableQuery,
	SurveyTableView,
	SurveyTableViewRow,
	SurveyWithRecipient,
} from './survey.types';

export class SurveyReadService extends BaseService {
	private programAccessService = new ProgramAccessReadService();
	private recipientService = new RecipientReadService();
	private surveyScheduleService = new SurveyScheduleService();

	private buildSurveyOrderBy(query: SurveyTableQuery): Prisma.SurveyOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'name',
			'recipientName',
			'programName',
			'questionnaire',
			'language',
			'status',
			'dueAt',
			'completedAt',
			'createdAt',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'name':
				return [{ name: direction }];
			case 'recipientName':
				return [
					{ recipient: { contact: { firstName: direction } } },
					{ recipient: { contact: { lastName: direction } } },
				];
			case 'programName':
				return [{ recipient: { program: { name: direction } } }];
			case 'questionnaire':
				return [{ questionnaire: direction }];
			case 'language':
				return [{ language: direction }];
			case 'status':
				return [{ status: direction }];
			case 'dueAt':
				return [{ dueAt: direction }];
			case 'completedAt':
				return [{ completedAt: direction }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ dueAt: 'desc' }];
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

	private rndString(bytes: number): string {
		return crypto.randomBytes(bytes).toString('base64url');
	}

	async getTableView(userId: string): Promise<ServiceResult<SurveyTableView>> {
		const paginated = await this.getPaginatedTableView(userId, {
			page: 1,
			pageSize: 10_000,
			search: '',
		});
		if (!paginated.success) {
			return this.resultFail(paginated.error);
		}
		return this.resultOk({ tableRows: paginated.data.tableRows });
	}

	async getPaginatedTableView(
		userId: string,
		query: SurveyTableQuery,
	): Promise<ServiceResult<SurveyPaginatedTableView>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const accessiblePrograms = accessibleProgramsResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);
			const selectedProgramId = query.programId?.trim() || undefined;
			const filteredProgramIds = selectedProgramId ? programIds.filter((id) => id === selectedProgramId) : programIds;
			const programFilterOptions = Array.from(
				new Map(accessiblePrograms.map((p) => [p.programId, { id: p.programId, name: p.programName }])).values(),
			);
			if (selectedProgramId && filteredProgramIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions });
			}
			const search = query.search.trim();
			const where = search
				? {
						AND: [
							{ recipient: { programId: { in: filteredProgramIds } } },
							{
								OR: [
									{ name: { contains: search, mode: 'insensitive' as const } },
									{ recipient: { contact: { firstName: { contains: search, mode: 'insensitive' as const } } } },
									{ recipient: { contact: { lastName: { contains: search, mode: 'insensitive' as const } } } },
									{ recipient: { program: { name: { contains: search, mode: 'insensitive' as const } } } },
								],
							},
						],
					}
				: { recipient: { programId: { in: filteredProgramIds } } };

			const [surveys, totalCount] = await Promise.all([
				this.db.survey.findMany({
					where,
					select: {
						id: true,
						name: true,
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
					orderBy: this.buildSurveyOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.survey.count({ where }),
			]);

			const tableRows: SurveyTableViewRow[] = surveys
				.filter((s) => s.recipient.program !== null)
				.map((survey) => {
					const programId = survey.recipient.program!.id;

					const programPermissions = accessiblePrograms
						.filter((p) => p.programId === programId)
						.map((p) => p.permission);

					const permission = programPermissions.includes(ProgramPermission.operator)
						? ProgramPermission.operator
						: ProgramPermission.owner;

					return {
						id: survey.id,
						name: survey.name,
						recipientName:
							`${survey.recipient.contact?.firstName ?? ''} ${survey.recipient.contact?.lastName ?? ''}`.trim(),
						programId,
						programName: survey.recipient.program!.name,
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

			return this.resultOk({ tableRows, totalCount, programFilterOptions });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch surveys: ${JSON.stringify(error)}`);
		}
	}

	async getUpcomingSurveyTableView(userId: string): Promise<ServiceResult<SurveyTableView>> {
		const paginated = await this.getPaginatedUpcomingSurveyTableView(userId, {
			page: 1,
			pageSize: 10_000,
			search: '',
		});
		if (!paginated.success) {
			return this.resultFail(paginated.error);
		}
		return this.resultOk({ tableRows: paginated.data.tableRows });
	}

	async getPaginatedUpcomingSurveyTableView(
		userId: string,
		query: SurveyTableQuery,
	): Promise<ServiceResult<SurveyPaginatedTableView>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const accessiblePrograms = accessibleProgramsResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);
			const selectedProgramId = query.programId?.trim() || undefined;
			const filteredProgramIds = selectedProgramId ? programIds.filter((id) => id === selectedProgramId) : programIds;
			const programFilterOptions = Array.from(
				new Map(accessiblePrograms.map((p) => [p.programId, { id: p.programId, name: p.programName }])).values(),
			);
			if (selectedProgramId && filteredProgramIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions });
			}

			const nowDate = now();
			const from = startOfMonth(subMonths(nowDate, 1));
			const to = endOfMonth(nowDate);
			const search = query.search.trim();
			const where = search
				? {
						AND: [
							{
								status: { not: SurveyStatus.completed },
								dueAt: {
									gte: from,
									lte: to,
								},
								recipient: {
									programId: { in: filteredProgramIds },
								},
							},
							{
								OR: [
									{ name: { contains: search, mode: 'insensitive' as const } },
									{ recipient: { contact: { firstName: { contains: search, mode: 'insensitive' as const } } } },
									{ recipient: { contact: { lastName: { contains: search, mode: 'insensitive' as const } } } },
									{ recipient: { program: { name: { contains: search, mode: 'insensitive' as const } } } },
								],
							},
						],
					}
				: {
						status: { not: SurveyStatus.completed },
						dueAt: {
							gte: from,
							lte: to,
						},
						recipient: {
							programId: { in: filteredProgramIds },
						},
					};

			const [surveys, totalCount] = await Promise.all([
				this.db.survey.findMany({
					where,
					select: {
						id: true,
						name: true,
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
					orderBy: this.buildSurveyOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.survey.count({ where }),
			]);

			const tableRows: SurveyTableViewRow[] = surveys
				.filter((s) => s.recipient.program !== null)
				.map((survey) => {
					const programId = survey.recipient.program!.id;

					const permissions = accessiblePrograms.filter((p) => p.programId === programId).map((p) => p.permission);

					const permission = permissions.includes(ProgramPermission.operator)
						? ProgramPermission.operator
						: ProgramPermission.owner;

					return {
						id: survey.id,
						name: survey.name,
						recipientName:
							`${survey.recipient.contact?.firstName ?? ''} ${survey.recipient.contact?.lastName ?? ''}`.trim(),
						programId,
						programName: survey.recipient.program!.name,
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

			return this.resultOk({ tableRows, totalCount, programFilterOptions });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch upcoming surveys: ${JSON.stringify(error)}`);
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

	async get(userId: string, surveyId: string): Promise<ServiceResult<SurveyPayload>> {
		try {
			const survey = await this.db.survey.findUnique({
				where: { id: surveyId },
				include: {
					recipient: {
						select: { program: { select: { id: true } } },
					},
				},
			});

			if (!survey) {
				return this.resultFail('Survey not found');
			}

			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const programAccess = accessibleProgramsResult.data.find((p) => p.programId === survey.recipient.program?.id);
			if (!programAccess) {
				return this.resultFail('Access denied');
			}

			const payload: SurveyPayload = {
				id: survey.id,
				name: survey.name,
				questionnaire: survey.questionnaire,
				language: survey.language,
				dueAt: survey.dueAt,
				completedAt: survey.completedAt,
				status: survey.status,
				data: survey.data,
				accessEmail: survey.accessEmail,
				accessPw: survey.accessPw,
				recipientId: survey.recipientId,
				surveyScheduleId: survey.surveyScheduleId,
				createdAt: survey.createdAt,
				updatedAt: survey.updatedAt,
			};
			return this.resultOk(payload);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to get survey: ${JSON.stringify(error)}`);
		}
	}

	async previewSurveyGeneration(userId: string): Promise<ServiceResult<SurveyGenerationPreviewResult>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const accessiblePrograms = accessibleProgramsResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ surveys: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);

			const recipientsResult = await this.recipientService.getSurveyRecipients(programIds);
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			const schedulesResult = await this.surveyScheduleService.getByProgramIds(programIds);
			if (!schedulesResult.success) {
				return this.resultFail(schedulesResult.error);
			}

			const recipients = recipientsResult.data;
			const schedules = schedulesResult.data;

			const existingSurveys = await this.db.survey.findMany({
				where: {
					recipient: { id: { in: recipients.map((r) => r.id) } },
				},
				select: {
					recipientId: true,
					name: true,
					accessEmail: true,
				},
			});

			const surveys: SurveyCreateInput[] = [];

			for (const recipient of recipients) {
				if (!recipient.startDate) {
					continue;
				}

				const recipientSchedules = schedules.filter((schedule) => schedule.programId === recipient.programId);

				for (const schedule of recipientSchedules) {
					const hasExistingSurvey = existingSurveys.some(
						(existing) => existing.recipientId === recipient.id && existing.name === schedule.name,
					);

					if (hasExistingSurvey) {
						continue;
					}

					const dueDate = addMonths(recipient.startDate, schedule.dueInMonthsAfterStart);
					const surveyStatus = dueDate < now() ? SurveyStatus.missed : SurveyStatus.new;

					let email: string;
					do {
						// ensure uniqueness in preview list
						email = this.rndString(16).toLowerCase() + '@si.org';
					} while (existingSurveys.some((s) => s.accessEmail === email));

					const password = this.rndString(16);
					surveys.push({
						name: schedule.name,
						recipient: { connect: { id: recipient.id } },
						questionnaire: schedule.questionnaire,
						language: 'en',
						dueAt: dueDate,
						status: surveyStatus,
						data: {},
						accessEmail: email,
						accessPw: password,
						surveySchedule: { connect: { id: schedule.id } },
					});
				}
			}

			return this.resultOk({ surveys });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to preview survey generation: ${JSON.stringify(error)}`);
		}
	}

	async getByRecipientId(recipientId: string): Promise<ServiceResult<SurveyPayload[]>> {
		try {
			const surveys = await this.db.survey.findMany({
				where: { recipientId },
				orderBy: [{ dueAt: 'desc' }, { createdAt: 'desc' }],
			});
			return this.resultOk(surveys);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch surveys: ${JSON.stringify(error)}`);
		}
	}

	async getByAccessEmail(email: string): Promise<ServiceResult<SurveyPayload>> {
		try {
			const surveys = await this.db.survey.findUnique({
				where: { accessEmail: email },
			});
			if (!surveys) {
				return this.resultFail('Survey not found');
			}
			return this.resultOk(surveys);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch surveys: ${JSON.stringify(error)}`);
		}
	}

	async getByIdAndRecipient(surveyId: string, recipientId: string): Promise<ServiceResult<SurveyWithRecipient>> {
		try {
			const surveys = await this.db.survey.findUnique({
				where: { id: surveyId, recipientId },
				select: {
					id: true,
					name: true,
					questionnaire: true,
					status: true,
					data: true,
					language: true,
					recipient: {
						select: {
							id: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
								},
							},
						},
					},
				},
			});

			if (!surveys) {
				return this.resultFail('Survey not found');
			}
			return this.resultOk({
				...surveys,
				nameOfRecipient:
					`${surveys.recipient.contact?.firstName ?? ''} ${surveys.recipient.contact?.lastName ?? ''}`.trim(),
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch surveys: ${JSON.stringify(error)}`);
		}
	}
}
