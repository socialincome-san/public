import { LocalPartner } from '@/generated/prisma/client';
import { Session } from '@/lib/firebase/current-account';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserReadService } from '../user/user-read.service';
import { LocalPartnerCreateInput, LocalPartnerUpdateInput } from './local-partner.types';

export class LocalPartnerWriteService extends BaseService {
	private userService = new UserReadService();
	private firebaseAdminService = new FirebaseAdminService();

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

	async update(session: Session, input: LocalPartnerUpdateInput): Promise<ServiceResult<LocalPartner>> {
		if (session.type === 'local-partner') {
			input.id = session.id;
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

		if (session.type === 'contributor') {
			return this.resultFail('Permission denied');
		}

		if (session.type === 'user') {
			const isAdmin = await this.userService.isAdmin(session.id);
			if (!isAdmin.success) {
				return this.resultFail(isAdmin.error);
			}
			if (!isAdmin.data) {
				return this.resultFail('Permission denied');
			}
		}

		const newEmail = input.contact?.update?.data?.email?.toString() ?? null;
		const oldEmail = existing.contact?.email ?? null;
		const firebaseUid = existing.account.firebaseAuthUserId;

		if (session.type === 'user' && newEmail && newEmail !== oldEmail) {
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
}
