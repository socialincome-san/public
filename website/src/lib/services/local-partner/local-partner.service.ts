import { LocalPartner, PrismaClient } from '@/generated/prisma/client';
import { Actor } from '@/lib/firebase/current-account';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserService } from '../user/user.service';
import {
	LocalPartnerCreateInput,
	LocalPartnerOption,
	LocalPartnerPayload,
	LocalPartnerSession,
	LocalPartnerTableView,
	LocalPartnerTableViewRow,
	LocalPartnerUpdateInput,
} from './local-partner.types';

export class LocalPartnerService extends BaseService {
	private readonly userService: UserService;
	private readonly firebaseAdminService: FirebaseAdminService;

	constructor(db: PrismaClient, userService: UserService, firebaseAdminService: FirebaseAdminService) {
		super(db);
		this.userService = userService;
		this.firebaseAdminService = firebaseAdminService;
	}

	async create(userId: string, input: LocalPartnerCreateInput): Promise<ServiceResult<LocalPartner>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const email = input.contact?.create?.email?.toString();
			if (!email) {
				return this.resultFail('Local partner email is required');
			}

			const displayName = `${input.contact?.create?.firstName ?? ''} ${input.contact?.create?.lastName ?? ''}`.trim();

			const firebaseResult = await this.firebaseAdminService.getOrCreateUser({
				email,
				displayName,
			});

			if (!firebaseResult.success) {
				return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
			}

			const partner = await this.db.localPartner.create({
				data: {
					name: input.name,
					causes: input.causes,
					account: {
						create: {
							firebaseAuthUserId: firebaseResult.data.uid,
						},
					},
					contact: input.contact,
				},
			});

			return this.resultOk(partner);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create local partner: ${JSON.stringify(error)}`);
		}
	}

	async update(actor: Actor, input: LocalPartnerUpdateInput): Promise<ServiceResult<LocalPartner>> {
		if (actor.kind === 'local-partner') {
			input.id = actor.session.id;
		}
		const partnerId = input.id?.toString();
		if (!partnerId) {
			return this.resultFail('Local partner ID is required');
		}

		const existing = await this.db.localPartner.findUnique({
			where: { id: partnerId },
			select: {
				id: true,
				account: true,
				contact: {
					select: {
						email: true,
					},
				},
			},
		});

		if (!existing) {
			return this.resultFail('Local partner not found');
		}

		if (actor.kind === 'contributor') {
			return this.resultFail('Permission denied');
		}

		if (actor.kind === 'user') {
			const isAdmin = await this.userService.isAdmin(actor.session.id);
			if (!isAdmin.success) {
				return this.resultFail(isAdmin.error);
			}
		}

		const newEmail = input.contact?.update?.data?.email?.toString() ?? null;
		const oldEmail = existing.contact?.email ?? null;
		const firebaseUid = existing.account.firebaseAuthUserId;

		if (actor.kind === 'user' && newEmail && newEmail !== oldEmail) {
			const firebaseResult = await this.firebaseAdminService.updateByUid(firebaseUid, { email: newEmail });
			if (!firebaseResult.success) {
				this.logger.warn('Could not update Firebase Auth user', { error: firebaseResult.error });
			}
		}

		try {
			const updated = await this.db.localPartner.update({
				where: { id: partnerId },
				data: input,
			});

			return this.resultOk(updated);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update local partner: ${JSON.stringify(error)}`);
		}
	}

	async get(userId: string, localPartnerId: string): Promise<ServiceResult<LocalPartnerPayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const partner = await this.db.localPartner.findUnique({
				where: { id: localPartnerId },
				select: {
					id: true,
					name: true,
					causes: true,
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							gender: true,
							callingName: true,
							email: true,
							language: true,
							phone: true,
							profession: true,
							dateOfBirth: true,
							address: true,
						},
					},
				},
			});

			if (!partner) {
				return this.resultFail('Could not get local partner');
			}

			return this.resultOk(partner);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not get local partner: ${JSON.stringify(error)}`);
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<LocalPartnerTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const partners = await this.db.localPartner.findMany({
				select: {
					id: true,
					name: true,
					createdAt: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							phone: { select: { number: true } },
						},
					},
					_count: { select: { recipients: true } },
				},
				orderBy: { name: 'asc' },
			});

			const tableRows: LocalPartnerTableViewRow[] = partners.map((partner) => ({
				id: partner.id,
				name: partner.name,
				contactPerson: `${partner.contact?.firstName ?? ''} ${partner.contact?.lastName ?? ''}`.trim(),
				contactNumber: partner.contact?.phone?.number ?? null,
				recipientsCount: partner._count.recipients,
				createdAt: partner.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch local partners: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(): Promise<ServiceResult<LocalPartnerOption[]>> {
		try {
			const partners = await this.db.localPartner.findMany({
				select: {
					id: true,
					name: true,
				},
				orderBy: { name: 'asc' },
			});

			return this.resultOk(partners);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch local partners: ${JSON.stringify(error)}`);
		}
	}

	async getCurrentLocalPartnerSession(firebaseAuthUserId: string): Promise<ServiceResult<LocalPartnerSession>> {
		try {
			const partner = await this.db.localPartner.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					name: true,
					causes: true,
					contact: {
						select: {
							gender: true,
							email: true,
							firstName: true,
							lastName: true,
							language: true,
							address: {
								select: {
									street: true,
									number: true,
									city: true,
									zip: true,
									country: true,
								},
							},
						},
					},
				},
			});

			if (!partner) {
				return this.resultFail('Local partner not found');
			}

			const session: LocalPartnerSession = {
				type: 'local-partner',
				id: partner.id,
				name: partner.name,
				causes: partner.causes,
				gender: partner.contact?.gender ?? null,
				email: partner.contact?.email ?? null,
				firstName: partner.contact?.firstName ?? null,
				lastName: partner.contact?.lastName ?? null,
				language: partner.contact?.language ?? null,
				street: partner.contact?.address?.street ?? null,
				number: partner.contact?.address?.number ?? null,
				city: partner.contact?.address?.city ?? null,
				zip: partner.contact?.address?.zip ?? null,
				country: partner.contact?.address?.country ?? null,
			};

			return this.resultOk(session);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch local partner session: ${JSON.stringify(error)}`);
		}
	}
}
