import { PayoutInterval, PayoutStatus, Prisma, PrismaClient, ProgramPermission } from '@/generated/prisma/client';
import { Session } from '@/lib/firebase/current-account';
import { stringifyCsv } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { AppReviewModeService } from '../app-review-mode/app-review-mode.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { RecipientStatusService } from './recipient-status.service';
import {
	RecipientPaginatedTableView,
	RecipientTableQuery,
	RecipientTableView,
	RecipientTableViewRow,
} from './recipient-table.types';
import { RecipientLifecycleStatus, RecipientOption, RecipientPayload, RecipientWithPaymentInfo } from './recipient.types';

export class RecipientReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly appReviewModeService: AppReviewModeService,
		private readonly recipientStatusService: RecipientStatusService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private buildRecipientOrderBy(query: RecipientTableQuery): Prisma.RecipientOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'recipient',
			'country',
			'paymentCode',
			'dateOfBirth',
			'localPartnerName',
			'programName',
			'startDate',
			'status',
			'createdAt',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'recipient':
				return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
			case 'country':
				return [{ contact: { address: { country: direction } } }];
			case 'paymentCode':
				return [{ paymentInformation: { code: direction } }];
			case 'dateOfBirth':
				return [{ contact: { dateOfBirth: direction } }];
			case 'localPartnerName':
				return [{ localPartner: { name: direction } }];
			case 'programName':
				return [{ program: { name: direction } }];
			case 'startDate':
				return [{ startDate: direction }];
			case 'status':
				return [{ createdAt: 'desc' }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	private getRecipientStatusSortRank(status: RecipientLifecycleStatus): number {
		switch (status) {
			case 'future':
				return 0;
			case 'active':
				return 1;
			case 'suspended':
				return 2;
			case 'completed':
				return 3;
		}
	}

	private sortRowsByStatus(rows: RecipientTableViewRow[], query: RecipientTableQuery): RecipientTableViewRow[] {
		const direction = query.sortDirection === 'asc' ? 1 : -1;
		const sortedRows = [...rows];
		sortedRows.sort((left, right) => {
			const byStatus =
				(this.getRecipientStatusSortRank(left.status) - this.getRecipientStatusSortRank(right.status)) * direction;
			if (byStatus !== 0) {
				return byStatus;
			}

			const byFirstName = left.firstName.localeCompare(right.firstName) * direction;
			if (byFirstName !== 0) {
				return byFirstName;
			}

			return left.lastName.localeCompare(right.lastName) * direction;
		});

		return sortedRows;
	}

	private parseRecipientStatusFilter(status: string | undefined): RecipientLifecycleStatus | undefined {
		if (status === 'future' || status === 'active' || status === 'suspended' || status === 'completed') {
			return status;
		}

		return undefined;
	}

	private mapToRecipientTableRows(
		recipients: {
			id: string;
			startDate: Date | null;
			suspendedAt: Date | null;
			suspensionReason: string | null;
			createdAt: Date;
			paymentInformation: { code: string | null } | null;
			contact: {
				firstName: string;
				lastName: string;
				dateOfBirth: Date | null;
				address: { country: RecipientTableViewRow['country'] } | null;
			} | null;
			program: {
				id: string;
				name: string;
				programDurationInMonths: number;
				payoutInterval: PayoutInterval;
			} | null;
			localPartner: {
				name?: string | null;
				account: { firebaseAuthUserId: string | null } | null;
				contact: { address: { country: RecipientTableViewRow['country'] } | null } | null;
			} | null;
			payouts: { status: PayoutStatus }[];
		}[],
		getPermission: (programId: string | null) => ProgramPermission,
		getLocalPartnerName: (recipient: { localPartner: { name?: string | null } | null }) => string | null,
		nowDate: Date,
	): RecipientTableViewRow[] {
		return recipients.map((recipient) => {
			const payoutsReceived = recipient.payouts.length;
			const payoutsTotal = recipient.program?.programDurationInMonths ?? 0;
			const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;
			const paidOrConfirmedCountResult = this.recipientStatusService.countPaidOrConfirmedPayouts(recipient.payouts);
			const paidOrConfirmedCount = paidOrConfirmedCountResult.success ? paidOrConfirmedCountResult.data : 0;
			const statusResult = recipient.program
				? this.recipientStatusService.getRecipientLifecycleStatus({
						startDate: recipient.startDate,
						suspendedAt: recipient.suspendedAt,
						paidOrConfirmedCount,
						programDurationInMonths: recipient.program.programDurationInMonths,
						payoutInterval: recipient.program.payoutInterval,
						nowDate,
					})
				: this.resultOk<RecipientLifecycleStatus>('future');
			const status = statusResult.success ? statusResult.data : 'future';

			return {
				id: recipient.id,
				firebaseAuthUserId: recipient.localPartner?.account?.firebaseAuthUserId ?? '',
				country: recipient.contact?.address?.country ?? recipient.localPartner?.contact?.address?.country ?? null,
				firstName: recipient.contact?.firstName ?? '',
				lastName: recipient.contact?.lastName ?? '',
				paymentCode: recipient.paymentInformation?.code ?? null,
				dateOfBirth: recipient.contact?.dateOfBirth ?? null,
				startDate: recipient.startDate ?? null,
				localPartnerName: getLocalPartnerName(recipient),
				suspendedAt: recipient.suspendedAt,
				suspensionReason: recipient.suspensionReason,
				programId: recipient.program?.id ?? null,
				programName: recipient.program?.name ?? null,
				payoutsReceived,
				payoutsTotal,
				payoutsProgressPercent,
				createdAt: recipient.createdAt,
				status,
				permission: getPermission(recipient.program?.id ?? null),
			};
		});
	}

	async get(session: Session, recipientId: string): Promise<ServiceResult<RecipientPayload>> {
		try {
			const recipient = await this.db.recipient.findUnique({
				where: { id: recipientId },
				select: {
					id: true,
					startDate: true,
					suspendedAt: true,
					suspensionReason: true,
					successorName: true,
					termsAccepted: true,
					localPartner: {
						select: {
							id: true,
							name: true,
						},
					},
					program: {
						select: {
							id: true,
							name: true,
						},
					},
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							callingName: true,
							email: true,
							gender: true,
							language: true,
							dateOfBirth: true,
							profession: true,
							phone: true,
							address: true,
						},
					},
					paymentInformation: {
						select: {
							id: true,
							code: true,
							mobileMoneyProvider: { select: { id: true, name: true } },
							phone: true,
						},
					},
				},
			});

			if (!recipient) {
				return this.resultFail('Recipient not found');
			}

			if (session.type === 'user') {
				const userId = session.id;
				const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
				if (!accessResult.success) {
					return this.resultFail(accessResult.error);
				}
				const hasAccess = accessResult.data.some((a) => a.programId === recipient.program?.id);
				if (!hasAccess) {
					return this.resultFail('Permission denied');
				}
			}

			if (session.type === 'local-partner') {
				const partnerId = session.id;
				if (recipient.localPartner?.id !== partnerId) {
					return this.resultFail('Permission denied');
				}
			}

			if (session.type === 'contributor') {
				return this.resultFail('Permission denied');
			}

			return this.resultOk(recipient as RecipientPayload);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch recipient: ${JSON.stringify(error)}`);
		}
	}

	async getEditableRecipientOptions(userId: string): Promise<ServiceResult<RecipientOption[]>> {
		try {
			const access = await this.programAccessService.getAccessiblePrograms(userId);

			if (!access.success) {
				return this.resultFail(access.error);
			}

			const editablePrograms = access.data
				.filter((p) => p.permission === ProgramPermission.operator)
				.map((p) => p.programId);

			if (editablePrograms.length === 0) {
				return this.resultOk([]);
			}

			const recipients = await this.db.recipient.findMany({
				where: { programId: { in: editablePrograms } },
				select: {
					id: true,
					contact: { select: { firstName: true, lastName: true } },
				},
				orderBy: [{ contact: { firstName: 'asc' } }],
			});

			const options = recipients.map((r) => ({
				id: r.id,
				fullName: `${r.contact.firstName} ${r.contact.lastName}`,
			}));

			return this.resultOk(options);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch editable recipient options: ${JSON.stringify(error)}`);
		}
	}

	async getSurveyRecipients(
		programIds: string[],
	): Promise<ServiceResult<{ id: string; programId: string | null; startDate: Date | null }[]>> {
		try {
			const recipients = await this.db.recipient.findMany({
				where: {
					programId: { in: programIds },
					suspendedAt: null,
					startDate: { lte: now() },
				},
				select: {
					id: true,
					programId: true,
					startDate: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
					program: {
						select: {
							name: true,
						},
					},
				},
			});

			return this.resultOk(recipients);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get survey recipients: ${JSON.stringify(error)}`);
		}
	}

	async getByPaymentPhoneNumber(phoneNumber: string): Promise<ServiceResult<RecipientWithPaymentInfo | null>> {
		try {
			const recipient = await this.db.recipient.findFirst({
				where: {
					paymentInformation: {
						phone: {
							number: phoneNumber,
						},
					},
				},
				include: {
					contact: {
						include: {
							phone: true,
						},
					},
					paymentInformation: {
						include: {
							phone: true,
							mobileMoneyProvider: true,
						},
					},
					program: {
						include: {
							country: {
								select: {
									isoCode: true,
									currency: true,
								},
							},
						},
					},
					localPartner: {
						include: {
							contact: {
								include: {
									phone: true,
								},
							},
						},
					},
				},
			});

			return this.resultOk(recipient);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not find recipient by phone number: ${JSON.stringify(error)}`);
		}
	}

	async getRecipientFromRequest(request: Request): Promise<ServiceResult<RecipientWithPaymentInfo>> {
		try {
			const tokenResult = await this.firebaseAdminService.getDecodedTokenFromRequest(request);
			if (!tokenResult.success) {
				return this.resultFail(tokenResult.error, 401);
			}

			const phoneResult = this.firebaseAdminService.getPhoneFromToken(tokenResult.data);
			if (!phoneResult.success) {
				return this.resultFail(phoneResult.error, 400);
			}
			const phone = phoneResult.data;

			if (!phone) {
				return this.resultFail('Phone number not present in token', 400);
			}

			const bypassResult = this.appReviewModeService.shouldBypass(phone);
			if (!bypassResult.success) {
				return this.resultFail(bypassResult.error);
			}
			if (bypassResult.data) {
				const mockResult = this.appReviewModeService.getMockRecipient(phone);
				if (mockResult.success) {
					return mockResult;
				}

				return this.resultFail(mockResult.error ?? 'Could not create mock recipient');
			}

			const recipientResult = await this.getByPaymentPhoneNumber(phone);
			if (!recipientResult.success) {
				return this.resultFail(recipientResult.error, 500);
			}

			if (!recipientResult.data) {
				return this.resultFail(`No recipient found for phone "${phone.slice(0, 2)}****${phone.slice(-2)}"`, 404);
			}

			return this.resultOk(recipientResult.data);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not resolve recipient from request: ${JSON.stringify(error)}`);
		}
	}

	async exportCsv(session: Session): Promise<ServiceResult<string>> {
		if (session.type === 'contributor') {
			return this.resultFail('Permission denied');
		}

		try {
			let whereProgramIds: string[] | null = null;
			if (session.type === 'user') {
				const accessResult = await this.programAccessService.getAccessiblePrograms(session.id);
				if (!accessResult.success) {
					return this.resultFail(accessResult.error);
				}
				whereProgramIds = accessResult.data.map((a) => a.programId);
			}

			const recipients = await this.db.recipient.findMany({
				where:
					session.type === 'local-partner'
						? {
								localPartnerId: session.id,
								programId: { not: null },
							}
						: {
								programId: { in: whereProgramIds ?? [] },
							},
				select: {
					id: true,
					startDate: true,
					suspendedAt: true,
					suspensionReason: true,
					successorName: true,
					termsAccepted: true,
					createdAt: true,
					updatedAt: true,
					program: {
						select: {
							id: true,
							name: true,
						},
					},
					localPartner: {
						select: {
							id: true,
							name: true,
						},
					},
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							callingName: true,
							email: true,
							gender: true,
							language: true,
							dateOfBirth: true,
							profession: true,
							phone: { select: { number: true } },
							address: {
								select: {
									street: true,
									number: true,
									zip: true,
									city: true,
									country: true,
								},
							},
						},
					},
					paymentInformation: {
						select: {
							id: true,
							code: true,
							phone: { select: { number: true } },
							mobileMoneyProvider: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
				orderBy: [{ id: 'asc' }],
			});

			const formatDate = (value: Date | null | undefined) => (value ? value.toISOString() : '');
			const rows = recipients.map((recipient) => ({
				id: recipient.id,
				createdAt: formatDate(recipient.createdAt),
				updatedAt: formatDate(recipient.updatedAt),
				programId: recipient.program?.id ?? '',
				programName: recipient.program?.name ?? '',
				localPartnerId: recipient.localPartner?.id ?? '',
				localPartnerName: recipient.localPartner?.name ?? '',
				startDate: formatDate(recipient.startDate),
				suspendedAt: formatDate(recipient.suspendedAt),
				suspensionReason: recipient.suspensionReason ?? '',
				successorName: recipient.successorName ?? '',
				termsAccepted: recipient.termsAccepted ? 'true' : 'false',
				contactId: recipient.contact?.id ?? '',
				contactFirstName: recipient.contact?.firstName ?? '',
				contactLastName: recipient.contact?.lastName ?? '',
				contactCallingName: recipient.contact?.callingName ?? '',
				contactEmail: recipient.contact?.email ?? '',
				contactGender: recipient.contact?.gender ?? '',
				contactLanguage: recipient.contact?.language ?? '',
				contactDateOfBirth: formatDate(recipient.contact?.dateOfBirth),
				contactProfession: recipient.contact?.profession ?? '',
				contactPhone: recipient.contact?.phone?.number ?? '',
				contactAddressStreet: recipient.contact?.address?.street ?? '',
				contactAddressNumber: recipient.contact?.address?.number ?? '',
				contactAddressZip: recipient.contact?.address?.zip ?? '',
				contactAddressCity: recipient.contact?.address?.city ?? '',
				contactAddressCountry: recipient.contact?.address?.country ?? '',
				paymentInformationId: recipient.paymentInformation?.id ?? '',
				paymentMobileMoneyProviderId: recipient.paymentInformation?.mobileMoneyProvider?.id ?? '',
				paymentMobileMoneyProviderName: recipient.paymentInformation?.mobileMoneyProvider?.name ?? '',
				paymentCode: recipient.paymentInformation?.code ?? '',
				paymentPhone: recipient.paymentInformation?.phone?.number ?? '',
			}));

			const headers = [
				'id',
				'createdAt',
				'updatedAt',
				'programId',
				'programName',
				'localPartnerId',
				'localPartnerName',
				'startDate',
				'suspendedAt',
				'suspensionReason',
				'successorName',
				'termsAccepted',
				'contactId',
				'contactFirstName',
				'contactLastName',
				'contactCallingName',
				'contactEmail',
				'contactGender',
				'contactLanguage',
				'contactDateOfBirth',
				'contactProfession',
				'contactPhone',
				'contactAddressStreet',
				'contactAddressNumber',
				'contactAddressZip',
				'contactAddressCity',
				'contactAddressCountry',
				'paymentInformationId',
				'paymentMobileMoneyProviderId',
				'paymentMobileMoneyProviderName',
				'paymentCode',
				'paymentPhone',
			];

			return this.resultOk(stringifyCsv(rows, headers));
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not export recipients CSV: ${JSON.stringify(error)}`);
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [], permission: ProgramPermission.owner });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);

			const recipients = await this.db.recipient.findMany({
				where: {
					programId: { in: programIds },
				},
				select: {
					id: true,
					startDate: true,
					suspendedAt: true,
					suspensionReason: true,
					paymentInformation: {
						select: {
							code: true,
						},
					},
					contact: {
						select: {
							firstName: true,
							lastName: true,
							dateOfBirth: true,
							address: {
								select: {
									country: true,
								},
							},
						},
					},
					program: {
						select: {
							id: true,
							name: true,
							programDurationInMonths: true,
							payoutInterval: true,
						},
					},
					localPartner: {
						select: {
							name: true,
							account: {
								select: {
									firebaseAuthUserId: true,
								},
							},
							contact: {
								select: {
									address: {
										select: {
											country: true,
										},
									},
								},
							},
						},
					},
					payouts: {
						select: { status: true },
					},
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows = this.mapToRecipientTableRows(
				recipients,
				(programId) => {
					const programPermissions = accessiblePrograms.filter((p) => p.programId === programId).map((p) => p.permission);

					return programPermissions.includes(ProgramPermission.operator)
						? ProgramPermission.operator
						: ProgramPermission.owner;
				},
				(recipient) => recipient.localPartner?.name ?? null,
				now(),
			);

			const globalPermission = accessiblePrograms.some((p) => p.permission === ProgramPermission.operator)
				? ProgramPermission.operator
				: ProgramPermission.owner;

			return this.resultOk({ tableRows, permission: globalPermission });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch recipients: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: RecipientTableQuery,
	): Promise<ServiceResult<RecipientPaginatedTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({
					tableRows: [],
					totalCount: 0,
					permission: ProgramPermission.owner,
					programFilterOptions: [],
				});
			}

			const programIds = accessiblePrograms.map((p) => p.programId);
			const search = query.search.trim();
			const selectedProgramIdRaw = query.programId?.trim();
			const selectedProgramId = selectedProgramIdRaw === '' ? undefined : selectedProgramIdRaw;
			const selectedRecipientStatus = this.parseRecipientStatusFilter(query.recipientStatus);
			const filteredProgramIds = selectedProgramId ? programIds.filter((id) => id === selectedProgramId) : programIds;
			if (selectedProgramId && filteredProgramIds.length === 0) {
				return this.resultOk({
					tableRows: [],
					totalCount: 0,
					permission: ProgramPermission.owner,
					programFilterOptions: accessiblePrograms.map((p) => ({ id: p.programId, name: p.programName })),
				});
			}
			const skip = (query.page - 1) * query.pageSize;
			const shouldSortOrFilterByStatus = query.sortBy === 'status' || Boolean(selectedRecipientStatus);
			const baseWhere: Prisma.RecipientWhereInput = {
				programId: { in: filteredProgramIds },
			};
			const searchWhere: Prisma.RecipientWhereInput =
				search.length > 0
					? {
							OR: [
								{ id: { contains: search, mode: 'insensitive' } },
								{ contact: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
								{ contact: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
								{ paymentInformation: { is: { code: { contains: search, mode: 'insensitive' } } } },
								{ localPartner: { is: { name: { contains: search, mode: 'insensitive' } } } },
								{ program: { is: { name: { contains: search, mode: 'insensitive' } } } },
							],
						}
					: {};
			const where: Prisma.RecipientWhereInput = {
				AND: [baseWhere, searchWhere],
			};

			const recipientSelect = {
				id: true,
				startDate: true,
				suspendedAt: true,
				suspensionReason: true,
				paymentInformation: {
					select: {
						code: true,
					},
				},
				contact: {
					select: {
						firstName: true,
						lastName: true,
						dateOfBirth: true,
						address: {
							select: {
								country: true,
							},
						},
					},
				},
				program: {
					select: {
						id: true,
						name: true,
						programDurationInMonths: true,
						payoutInterval: true,
					},
				},
				localPartner: {
					select: {
						name: true,
						account: {
							select: {
								firebaseAuthUserId: true,
							},
						},
						contact: {
							select: {
								address: {
									select: {
										country: true,
									},
								},
							},
						},
					},
				},
				payouts: {
					select: { status: true },
				},
				createdAt: true,
			} satisfies Prisma.RecipientSelect;

			const [allRecipients, totalCount] = shouldSortOrFilterByStatus
				? await Promise.all([
						this.db.recipient.findMany({
							where,
							select: recipientSelect,
							orderBy: this.buildRecipientOrderBy(query),
						}),
						this.db.recipient.count({ where }),
					])
				: await Promise.all([
						this.db.recipient.findMany({
							where,
							select: recipientSelect,
							orderBy: this.buildRecipientOrderBy(query),
							skip,
							take: query.pageSize,
						}),
						this.db.recipient.count({ where }),
					]);

			let tableRows = this.mapToRecipientTableRows(
				allRecipients,
				(programId) => {
					const programPermissions = accessiblePrograms.filter((p) => p.programId === programId).map((p) => p.permission);

					return programPermissions.includes(ProgramPermission.operator)
						? ProgramPermission.operator
						: ProgramPermission.owner;
				},
				(recipient) => recipient.localPartner?.name ?? null,
				now(),
			);
			if (selectedRecipientStatus) {
				tableRows = tableRows.filter((row) => row.status === selectedRecipientStatus);
			}
			if (query.sortBy === 'status') {
				tableRows = this.sortRowsByStatus(tableRows, query);
			}
			const paginatedRows = shouldSortOrFilterByStatus ? tableRows.slice(skip, skip + query.pageSize) : tableRows;
			const computedTotalCount = shouldSortOrFilterByStatus ? tableRows.length : totalCount;

			const globalPermission = accessiblePrograms.some((p) => p.permission === ProgramPermission.operator)
				? ProgramPermission.operator
				: ProgramPermission.owner;
			const programFilterOptions = Array.from(
				new Map(accessiblePrograms.map((p) => [p.programId, { id: p.programId, name: p.programName }])).values(),
			);

			return this.resultOk({
				tableRows: paginatedRows,
				totalCount: computedTotalCount,
				permission: globalPermission,
				programFilterOptions,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch recipients: ${JSON.stringify(error)}`);
		}
	}

	async getTableViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const permission = accessResult.data.some(
				(a) => a.programId === programId && a.permission === ProgramPermission.operator,
			)
				? ProgramPermission.operator
				: ProgramPermission.owner;

			const base = await this.getTableView(userId);
			if (!base.success) {
				return base;
			}

			const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);

			return this.resultOk({
				tableRows: filteredRows,
				permission,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch program scoped recipients: ${JSON.stringify(error)}`);
		}
	}

	async getTableViewByLocalPartnerId(localPartnerId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const paginated = await this.getPaginatedTableViewByLocalPartnerId(localPartnerId, {
				page: 1,
				pageSize: 10_000,
				search: '',
			});
			if (!paginated.success) {
				return this.resultFail(paginated.error);
			}

			return this.resultOk({
				tableRows: paginated.data.tableRows,
				permission: paginated.data.permission,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch local partner recipients table view: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableViewByLocalPartnerId(
		localPartnerId: string,
		query: RecipientTableQuery,
	): Promise<ServiceResult<RecipientPaginatedTableView>> {
		try {
			const selectedProgramIdRaw = query.programId?.trim();
			const selectedProgramId = selectedProgramIdRaw === '' ? undefined : selectedProgramIdRaw;
			const selectedRecipientStatus = this.parseRecipientStatusFilter(query.recipientStatus);
			const shouldSortOrFilterByStatus = query.sortBy === 'status' || Boolean(selectedRecipientStatus);
			const baseWhere = {
				localPartnerId,
				programId: { not: null },
				...(selectedProgramId ? { programId: selectedProgramId } : {}),
			};
			const search = query.search.trim();
			const where = search
				? {
						AND: [
							baseWhere,
							{
								OR: [
									{ id: { contains: search, mode: 'insensitive' as const } },
									{ contact: { firstName: { contains: search, mode: 'insensitive' as const } } },
									{ contact: { lastName: { contains: search, mode: 'insensitive' as const } } },
									{ paymentInformation: { code: { contains: search, mode: 'insensitive' as const } } },
									{ program: { name: { contains: search, mode: 'insensitive' as const } } },
								],
							},
						],
					}
				: baseWhere;

			const skip = (query.page - 1) * query.pageSize;
			const recipientSelect = {
				id: true,
				startDate: true,
				suspendedAt: true,
				suspensionReason: true,
				paymentInformation: {
					select: {
						code: true,
					},
				},
				contact: {
					select: {
						firstName: true,
						lastName: true,
						dateOfBirth: true,
						address: {
							select: {
								country: true,
							},
						},
					},
				},
				program: {
					select: {
						id: true,
						name: true,
						programDurationInMonths: true,
						payoutInterval: true,
					},
				},
				localPartner: {
					select: {
						account: {
							select: {
								firebaseAuthUserId: true,
							},
						},
						contact: {
							select: {
								address: {
									select: {
										country: true,
									},
								},
							},
						},
					},
				},
				payouts: {
					select: { status: true },
				},
				createdAt: true,
			} satisfies Prisma.RecipientSelect;

			const [allRecipients, totalCount, filterSource] = await Promise.all([
				shouldSortOrFilterByStatus
					? this.db.recipient.findMany({
							where,
							select: recipientSelect,
							orderBy: this.buildRecipientOrderBy(query),
						})
					: this.db.recipient.findMany({
							where,
							select: recipientSelect,
							orderBy: this.buildRecipientOrderBy(query),
							skip,
							take: query.pageSize,
						}),
				this.db.recipient.count({ where }),
				this.db.recipient.findMany({
					where: {
						localPartnerId,
						programId: { not: null },
					},
					select: {
						program: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				}),
			]);

			let tableRows = this.mapToRecipientTableRows(
				allRecipients,
				() => ProgramPermission.operator,
				() => null,
				now(),
			);
			if (selectedRecipientStatus) {
				tableRows = tableRows.filter((row) => row.status === selectedRecipientStatus);
			}
			if (query.sortBy === 'status') {
				tableRows = this.sortRowsByStatus(tableRows, query);
			}
			const paginatedRows = shouldSortOrFilterByStatus ? tableRows.slice(skip, skip + query.pageSize) : tableRows;
			const computedTotalCount = shouldSortOrFilterByStatus ? tableRows.length : totalCount;

			const programFilterOptions = Array.from(
				new Map(
					filterSource
						.map((row) => row.program)
						.filter((program): program is NonNullable<typeof program> => Boolean(program?.id && program.name))
						.map((program) => [program.id, { id: program.id, name: program.name }]),
				).values(),
			).sort((a, b) => a.name.localeCompare(b.name));

			return this.resultOk({
				tableRows: paginatedRows,
				totalCount: computedTotalCount,
				permission: ProgramPermission.operator,
				programFilterOptions,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch recipients for local partner: ${JSON.stringify(error)}`);
		}
	}
}
