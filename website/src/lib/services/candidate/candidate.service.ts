import { Actor } from '@/lib/firebase/current-account';
import { Cause, Prisma } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';
import {
	CandidateCreateInput,
	CandidatePayload,
	CandidatePrismaUpdateInput,
	CandidatesTableView,
	CandidatesTableViewRow,
} from './candidate.types';

export class CandidateService extends BaseService {
	private userService = new UserService();
	private firebaseService = new FirebaseService();

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

	async create(actor: Actor, data: CandidateCreateInput): Promise<ServiceResult<CandidatePayload>> {
		if (actor.kind === 'contributor') {
			return this.resultFail('Permission denied');
		}

		if (actor.kind === 'user') {
			const admin = await this.assertAdmin(actor.session.id);
			if (!admin.success) {
				return this.resultFail(admin.error);
			}
		}

		if (actor.kind === 'local-partner') {
			data.localPartner = { connect: { id: actor.session.id } };
		}

		data.program = undefined;

		const phone = data.paymentInformation?.create?.phone?.create?.number;
		if (!phone) {
			return this.resultFail('No phone number provided for candidate creation');
		}

		try {
			return await this.db.$transaction(async (tx) => {
				const created = await tx.recipient.create({
					data,
					select: {
						id: true,
						status: true,
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
								provider: true,
								phone: true,
							},
						},
					},
				});

				const firebaseResult = await this.firebaseService.createByPhoneNumber(phone);
				if (!firebaseResult.success) {
					throw new Error(`Failed to create Firebase user: ${firebaseResult.error}`);
				}

				return this.resultOk(created);
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create candidate: ${JSON.stringify(error)}`);
		}
	}

	async update(
		actor: Actor,
		updateInput: CandidatePrismaUpdateInput,
		nextPaymentPhoneNumber: string | null,
	): Promise<ServiceResult<CandidatePayload>> {
		if (actor.kind === 'contributor') {
			return this.resultFail('Permission denied');
		}

		const candidateId = updateInput.id as string;

		const existing = await this.db.recipient.findUnique({
			where: { id: candidateId },
			select: {
				localPartnerId: true,
				programId: true,
				paymentInformation: {
					select: {
						phone: { select: { number: true } },
					},
				},
			},
		});

		if (!existing) {
			return this.resultFail('Candidate not found');
		}

		if (existing.programId !== null) {
			return this.resultFail('Not a candidate');
		}

		if (actor.kind === 'user') {
			const admin = await this.assertAdmin(actor.session.id);
			if (!admin.success) {
				return this.resultFail(admin.error);
			}
		}

		if (actor.kind === 'local-partner') {
			if (existing.localPartnerId !== actor.session.id) {
				return this.resultFail('Permission denied');
			}
			delete updateInput.localPartner;
		}

		updateInput.program = undefined;

		const previous = existing.paymentInformation?.phone?.number ?? null;
		const paymentPhoneHasChanged =
			previous !== null && nextPaymentPhoneNumber !== null && previous !== nextPaymentPhoneNumber;

		try {
			if (paymentPhoneHasChanged) {
				const firebaseResult = await this.firebaseService.updateByPhoneNumber(previous!, nextPaymentPhoneNumber!);
				if (!firebaseResult.success) {
					return this.resultFail(`Failed to update Firebase user: ${firebaseResult.error}`);
				}
			}

			const updated = await this.db.recipient.update({
				where: { id: candidateId },
				data: updateInput,
				select: {
					id: true,
					status: true,
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
							provider: true,
							phone: true,
						},
					},
				},
			});

			return this.resultOk(updated);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update candidate: ${JSON.stringify(error)}`);
		}
	}

	async get(actor: Actor, id: string): Promise<ServiceResult<CandidatePayload>> {
		if (actor.kind === 'contributor') {
			return this.resultFail('Permission denied');
		}

		const candidate = await this.db.recipient.findUnique({
			where: { id },
			select: {
				id: true,
				status: true,
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
						provider: true,
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

		if (actor.kind === 'user') {
			const admin = await this.assertAdmin(actor.session.id);
			if (!admin.success) {
				return this.resultFail(admin.error);
			}
		}

		if (actor.kind === 'local-partner') {
			if (candidate.localPartnerId !== actor.session.id) {
				return this.resultFail('Permission denied');
			}
		}

		return this.resultOk(candidate);
	}

	async getTableView(userId: string): Promise<ServiceResult<CandidatesTableView>> {
		const admin = await this.assertAdmin(userId);
		if (!admin.success) {
			return this.resultFail(admin.error);
		}

		try {
			const recipients = await this.db.recipient.findMany({
				where: { programId: null },
				select: {
					id: true,
					status: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							dateOfBirth: true,
						},
					},
					localPartner: { select: { name: true } },
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: CandidatesTableViewRow[] = recipients.map((r) => ({
				id: r.id,
				firstName: r.contact?.firstName ?? '',
				lastName: r.contact?.lastName ?? '',
				dateOfBirth: r.contact?.dateOfBirth ?? null,
				localPartnerName: r.localPartner?.name ?? null,
				status: r.status,
				createdAt: r.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch candidates: ${JSON.stringify(error)}`);
		}
	}

	async getTableViewByLocalPartner(localPartnerId: string): Promise<ServiceResult<CandidatesTableView>> {
		try {
			const recipients = await this.db.recipient.findMany({
				where: {
					programId: null,
					localPartnerId,
				},
				select: {
					id: true,
					status: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							dateOfBirth: true,
						},
					},
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: CandidatesTableViewRow[] = recipients.map((r) => ({
				id: r.id,
				firstName: r.contact?.firstName ?? '',
				lastName: r.contact?.lastName ?? '',
				dateOfBirth: r.contact?.dateOfBirth ?? null,
				localPartnerName: null,
				status: r.status,
				createdAt: r.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch candidates for local partner: ${JSON.stringify(error)}`);
		}
	}

	async getCandidateCount(causes?: Cause[]): Promise<ServiceResult<{ count: number }>> {
		try {
			const where: Prisma.RecipientWhereInput = {
				programId: null,
			};

			if (causes && causes.length > 0) {
				where.localPartner = {
					causes: {
						hasSome: causes,
					},
				};
			}

			const count = await this.db.recipient.count({ where });

			return this.resultOk({ count });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not count candidates: ${JSON.stringify(error)}`);
		}
	}

	async assignRandomCandidatesToProgram(
		programId: string,
		amountOfRecipientsForStart: number,
		causes?: Cause[],
	): Promise<ServiceResult<{ assigned: number }>> {
		try {
			const where: Prisma.RecipientWhereInput = {
				programId: null,
			};

			if (causes && causes.length > 0) {
				where.localPartner = {
					causes: { hasSome: causes },
				};
			}

			const allAvailableCandidates = await this.db.recipient.findMany({
				where,
				select: { id: true },
			});

			if (allAvailableCandidates.length < amountOfRecipientsForStart) {
				return this.resultFail(
					`Not enough candidates available. Requested ${amountOfRecipientsForStart}, but only ${allAvailableCandidates.length} available.`,
				);
			}

			// simple random shuffle:
			// sort randomly so each run produces a different order
			const shuffled = [...allAvailableCandidates].sort(() => Math.random() - 0.5);

			const selectedIds = shuffled.slice(0, amountOfRecipientsForStart).map((c) => c.id);

			await this.db.recipient.updateMany({
				where: { id: { in: selectedIds } },
				data: { programId },
			});

			return this.resultOk({ assigned: selectedIds.length });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not assign candidates: ${JSON.stringify(error)}`);
		}
	}
}
