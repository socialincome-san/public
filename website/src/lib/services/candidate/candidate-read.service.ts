import { Cause, CountryCode, Gender, Prisma, PrismaClient } from '@/generated/prisma/client';
import { Session } from '@/lib/firebase/current-account';
import { stringifyCsv } from '@/lib/utils/csv';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import {
	CandidatePayload,
	CandidatesPaginatedTableView,
	CandidatesTableQuery,
	CandidatesTableView,
	CandidatesTableViewRow,
	Profile,
} from './candidate.types';

export class CandidateReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private buildCandidateOrderBy(query: CandidatesTableQuery): Prisma.RecipientOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'candidate',
			'country',
			'gender',
			'dateOfBirth',
			'contactNumber',
			'localPartnerName',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'candidate':
				return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
			case 'country':
				return [{ contact: { address: { country: direction } } }];
			case 'gender':
				return [{ contact: { gender: direction } }];
			case 'dateOfBirth':
				return [{ contact: { dateOfBirth: direction } }];
			case 'contactNumber':
				return [{ contact: { phone: { number: direction } } }];
			case 'localPartnerName':
				return [{ localPartner: { name: direction } }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	private async assertAdmin(userId: string): Promise<ServiceResult<true>> {
		const isAdmin = await this.userService.isAdmin(userId);
		if (!isAdmin.success) {
			return this.resultFail(isAdmin.error);
		}
		if (!isAdmin.data) {
			return this.resultFail('Permission denied');
		}

		return this.resultOk(true);
	}

	private buildCandidateWhere(
		causes?: Cause[],
		profiles?: Profile[],
		countryCode?: CountryCode | null,
	): Prisma.RecipientWhereInput {
		const where: Prisma.RecipientWhereInput = {
			programId: null,
		};

		if (countryCode) {
			where.AND = [
				{
					OR: [
						{
							contact: {
								address: {
									country: countryCode,
								},
							},
						},
						{
							AND: [
								{
									OR: [
										{
											contact: {
												address: null,
											},
										},
										{
											contact: {
												address: {
													country: null,
												},
											},
										},
									],
								},
								{
									localPartner: {
										contact: {
											address: {
												country: countryCode,
											},
										},
									},
								},
							],
						},
					],
				},
			];
		}

		if (causes && causes.length > 0) {
			where.localPartner = {
				causes: {
					hasSome: causes,
				},
			};
		}

		if (profiles && profiles.length > 0) {
			const contactFilters: Prisma.ContactWhereInput[] = [];

			const genderProfiles = profiles.filter((p) => p === Profile.male || p === Profile.female);

			if (genderProfiles.length > 0) {
				contactFilters.push({
					gender: {
						in: genderProfiles,
					},
				});
			}

			if (profiles.includes(Profile.youth)) {
				const nowDate = now();
				const youthCutoffDate = new Date(nowDate.getFullYear() - 25, nowDate.getMonth(), nowDate.getDate());

				contactFilters.push({
					dateOfBirth: {
						gte: youthCutoffDate,
					},
				});
			}

			if (contactFilters.length > 0) {
				where.contact = {
					OR: contactFilters,
				};
			}
		}

		return where;
	}

	async get(session: Session, id: string): Promise<ServiceResult<CandidatePayload>> {
		if (session.type === 'contributor') {
			return this.resultFail('Permission denied');
		}
		try {
			const candidate = await this.db.recipient.findUnique({
				where: { id },
				select: {
					id: true,
					suspendedAt: true,
					suspensionReason: true,
					successorName: true,
					termsAccepted: true,
					localPartner: { select: { id: true, name: true } },
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
					programId: true,
					localPartnerId: true,
				},
			});

			if (!candidate) {
				return this.resultFail('Candidate not found');
			}

			if (candidate.programId !== null) {
				return this.resultFail('Not a candidate');
			}

			if (session.type === 'user') {
				const admin = await this.assertAdmin(session.id);
				if (!admin.success) {
					return this.resultFail(admin.error);
				}
			}

			if (session.type === 'local-partner') {
				if (candidate.localPartnerId !== session.id) {
					return this.resultFail('Permission denied');
				}
			}

			return this.resultOk(candidate);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch candidate: ${JSON.stringify(error)}`);
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<CandidatesTableView>> {
		try {
			const paginated = await this.getPaginatedTableView(userId, {
				page: 1,
				pageSize: 10_000,
				search: '',
			});
			if (!paginated.success) {
				return this.resultFail(paginated.error);
			}

			return this.resultOk({ tableRows: paginated.data.tableRows });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch candidates table view: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: CandidatesTableQuery,
	): Promise<ServiceResult<CandidatesPaginatedTableView>> {
		try {
			const admin = await this.assertAdmin(userId);
			if (!admin.success) {
				return this.resultFail(admin.error);
			}

			const search = query.search.trim();
			const selectedCountry = (query.country?.trim() || undefined) as CountryCode | undefined;
			const selectedGender = (query.gender?.trim() || undefined) as Gender | undefined;
			const selectedLocalPartnerId = query.localPartnerId?.trim() || undefined;
			const baseScope: Prisma.RecipientWhereInput = {
				programId: null,
				...(selectedLocalPartnerId ? { localPartnerId: selectedLocalPartnerId } : {}),
				...(selectedGender ? { contact: { gender: selectedGender } } : {}),
			};
			const countryScope: Prisma.RecipientWhereInput | null = selectedCountry
				? {
						OR: [
							{ contact: { address: { country: selectedCountry } } },
							{
								AND: [
									{ contact: { address: { country: null } } },
									{ localPartner: { contact: { address: { country: selectedCountry } } } },
								],
							},
						],
					}
				: null;
			const where: Prisma.RecipientWhereInput = search
				? {
						AND: [
							baseScope,
							...(countryScope ? [countryScope] : []),
							{
								OR: [
									{ id: { contains: search, mode: 'insensitive' } },
									{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
									{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
									{ contact: { phone: { number: { contains: search, mode: 'insensitive' } } } },
									{ localPartner: { name: { contains: search, mode: 'insensitive' } } },
								],
							},
						],
					}
				: countryScope
					? { AND: [baseScope, countryScope] }
					: baseScope;

			const [recipients, totalCount, filterSource] = await Promise.all([
				this.db.recipient.findMany({
					where,
					select: {
						id: true,
						suspendedAt: true,
						suspensionReason: true,
						contact: {
							select: {
								firstName: true,
								lastName: true,
								dateOfBirth: true,
								gender: true,
								address: {
									select: {
										country: true,
									},
								},
								phone: {
									select: {
										number: true,
									},
								},
							},
						},
						localPartner: {
							select: {
								id: true,
								name: true,
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
					},
					orderBy: this.buildCandidateOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.recipient.count({ where }),
				this.db.recipient.findMany({
					where: { programId: null },
					select: {
						contact: {
							select: {
								gender: true,
								address: {
									select: {
										country: true,
									},
								},
							},
						},
						localPartner: {
							select: {
								id: true,
								name: true,
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
					},
				}),
			]);

			const tableRows: CandidatesTableViewRow[] = recipients.map((r) => ({
				id: r.id,
				firebaseAuthUserId: '',
				country: r.contact?.address?.country ?? r.localPartner?.contact?.address?.country ?? null,
				firstName: r.contact?.firstName ?? '',
				lastName: r.contact?.lastName ?? '',
				dateOfBirth: r.contact?.dateOfBirth ?? null,
				contactNumber: r.contact?.phone?.number ?? null,
				gender: r.contact?.gender ?? null,
				localPartnerName: r.localPartner?.name ?? null,
				suspendedAt: r.suspendedAt,
				suspensionReason: r.suspensionReason,
			}));

			const countryFilterOptions = Array.from(
				new Set(
					filterSource
						.map((row) => row.contact?.address?.country ?? row.localPartner?.contact?.address?.country ?? null)
						.filter((country): country is CountryCode => Boolean(country)),
				),
			)
				.sort()
				.map((country) => ({ value: country, label: country }));
			const localPartnerFilterOptions = Array.from(
				new Map(
					filterSource
						.map((row) => row.localPartner)
						.filter((partner): partner is NonNullable<typeof partner> => Boolean(partner?.id && partner.name))
						.map((partner) => [partner.id, { value: partner.id, label: partner.name }]),
				).values(),
			).sort((a, b) => a.label.localeCompare(b.label));
			const genderFilterOptions = Array.from(
				new Set(filterSource.map((row) => row.contact?.gender).filter((gender): gender is Gender => Boolean(gender))),
			)
				.sort()
				.map((gender) => ({ value: gender, label: gender }));

			return this.resultOk({
				tableRows,
				totalCount,
				countryFilterOptions,
				genderFilterOptions,
				localPartnerFilterOptions,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch candidates: ${JSON.stringify(error)}`);
		}
	}

	async getTableViewByLocalPartner(localPartnerId: string): Promise<ServiceResult<CandidatesTableView>> {
		try {
			const paginated = await this.getPaginatedTableViewByLocalPartner(localPartnerId, {
				page: 1,
				pageSize: 10_000,
				search: '',
			});
			if (!paginated.success) {
				return this.resultFail(paginated.error);
			}

			return this.resultOk({ tableRows: paginated.data.tableRows });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch local partner candidates table view: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableViewByLocalPartner(
		localPartnerId: string,
		query: CandidatesTableQuery,
	): Promise<ServiceResult<CandidatesPaginatedTableView>> {
		try {
			const search = query.search.trim();
			const selectedCountry = (query.country?.trim() || undefined) as CountryCode | undefined;
			const selectedGender = (query.gender?.trim() || undefined) as Gender | undefined;
			const baseWhere: Prisma.RecipientWhereInput = {
				programId: null,
				localPartnerId,
				...(selectedGender ? { contact: { gender: selectedGender } } : {}),
			};
			const countryWhere: Prisma.RecipientWhereInput | null = selectedCountry
				? {
						OR: [
							{ contact: { address: { country: selectedCountry } } },
							{
								AND: [
									{ contact: { address: { country: null } } },
									{ localPartner: { contact: { address: { country: selectedCountry } } } },
								],
							},
						],
					}
				: null;
			const where: Prisma.RecipientWhereInput = search
				? {
						AND: [
							baseWhere,
							...(countryWhere ? [countryWhere] : []),
							{
								OR: [
									{ id: { contains: search, mode: 'insensitive' } },
									{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
									{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
									{ contact: { phone: { number: { contains: search, mode: 'insensitive' } } } },
								],
							},
						],
					}
				: countryWhere
					? { AND: [baseWhere, countryWhere] }
					: baseWhere;

			const [recipients, totalCount, filterSource] = await Promise.all([
				this.db.recipient.findMany({
					where,
					select: {
						id: true,
						suspendedAt: true,
						suspensionReason: true,
						contact: {
							select: {
								firstName: true,
								lastName: true,
								dateOfBirth: true,
								gender: true,
								address: {
									select: {
										country: true,
									},
								},
								phone: {
									select: {
										number: true,
									},
								},
							},
						},
						localPartner: {
							select: {
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
					},
					orderBy: this.buildCandidateOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.recipient.count({ where }),
				this.db.recipient.findMany({
					where: { programId: null, localPartnerId },
					select: {
						contact: {
							select: {
								gender: true,
								address: {
									select: {
										country: true,
									},
								},
							},
						},
						localPartner: {
							select: {
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
					},
				}),
			]);

			const tableRows: CandidatesTableViewRow[] = recipients.map((r) => ({
				id: r.id,
				firebaseAuthUserId: '',
				country: r.contact?.address?.country ?? r.localPartner?.contact?.address?.country ?? null,
				firstName: r.contact?.firstName ?? '',
				lastName: r.contact?.lastName ?? '',
				dateOfBirth: r.contact?.dateOfBirth ?? null,
				contactNumber: r.contact?.phone?.number ?? null,
				gender: r.contact?.gender ?? null,
				localPartnerName: null,
				suspendedAt: r.suspendedAt,
				suspensionReason: r.suspensionReason,
			}));

			const countryFilterOptions = Array.from(
				new Set(
					filterSource
						.map((row) => row.contact?.address?.country ?? row.localPartner?.contact?.address?.country ?? null)
						.filter((country): country is CountryCode => Boolean(country)),
				),
			)
				.sort()
				.map((country) => ({ value: country, label: country }));
			const genderFilterOptions = Array.from(
				new Set(filterSource.map((row) => row.contact?.gender).filter((gender): gender is Gender => Boolean(gender))),
			)
				.sort()
				.map((gender) => ({ value: gender, label: gender }));

			return this.resultOk({
				tableRows,
				totalCount,
				countryFilterOptions,
				genderFilterOptions,
				localPartnerFilterOptions: [],
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch candidates for local partner: ${JSON.stringify(error)}`);
		}
	}

	async getCandidateCount(
		causes?: Cause[],
		profiles?: Profile[],
		countryId?: string | null,
	): Promise<ServiceResult<{ count: number }>> {
		try {
			let countryCode: CountryCode | null = null;

			if (countryId) {
				const country = await this.db.country.findUnique({
					where: { id: countryId },
					select: { isoCode: true },
				});

				if (!country) {
					return this.resultFail('Country not found');
				}

				countryCode = country.isoCode;
			}

			const where = this.buildCandidateWhere(causes, profiles, countryCode);
			const count = await this.db.recipient.count({ where });

			return this.resultOk({ count });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not count candidates: ${JSON.stringify(error)}`);
		}
	}

	async exportCsv(session: Session): Promise<ServiceResult<string>> {
		try {
			if (session.type === 'contributor') {
				return this.resultFail('Permission denied');
			}

			if (session.type === 'user') {
				const admin = await this.assertAdmin(session.id);
				if (!admin.success) {
					return this.resultFail(admin.error);
				}
			}

			const recipients = await this.db.recipient.findMany({
				where:
					session.type === 'local-partner'
						? {
								programId: null,
								localPartnerId: session.id,
							}
						: {
								programId: null,
							},
				select: {
					id: true,
					createdAt: true,
					updatedAt: true,
					suspendedAt: true,
					suspensionReason: true,
					successorName: true,
					termsAccepted: true,
					localPartner: {
						select: {
							id: true,
							name: true,
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
				orderBy: { createdAt: 'desc' },
			});

			const formatDate = (value: Date | null | undefined) => (value ? value.toISOString() : '');
			const rows = recipients.map((recipient) => ({
				id: recipient.id,
				createdAt: formatDate(recipient.createdAt),
				updatedAt: formatDate(recipient.updatedAt),
				localPartnerId: recipient.localPartner?.id ?? '',
				localPartnerName: recipient.localPartner?.name ?? '',
				suspendedAt: formatDate(recipient.suspendedAt),
				suspensionReason: recipient.suspensionReason ?? '',
				successorName: recipient.successorName ?? '',
				termsAccepted: recipient.termsAccepted ? 'true' : 'false',
				countryResolved: recipient.contact?.address?.country ?? recipient.localPartner?.contact?.address?.country ?? '',
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
				'localPartnerId',
				'localPartnerName',
				'suspendedAt',
				'suspensionReason',
				'successorName',
				'termsAccepted',
				'countryResolved',
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

			return this.resultFail(`Could not export candidates CSV: ${JSON.stringify(error)}`);
		}
	}
}
