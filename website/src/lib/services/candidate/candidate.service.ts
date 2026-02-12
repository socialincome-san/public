import { Cause, CountryCode, Prisma, RecipientStatus } from '@/generated/prisma/client';
import { Actor } from '@/lib/firebase/current-account';
import { parseCsvText } from '@/lib/utils/csv';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserService } from '../user/user.service';
import {
	CandidateCreateInput,
	CandidatePayload,
	CandidatePrismaUpdateInput,
	CandidatesTableView,
	CandidatesTableViewRow,
	Profile,
} from './candidate.types';

export class CandidateService extends BaseService {
	private userService = new UserService();
	private firebaseAdminService = new FirebaseAdminService();

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
									contact: {
										address: {
											country: null,
										},
									},
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
				const now = new Date();
				const youthCutoffDate = new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());

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

	async create(actor: Actor, candidate: CandidateCreateInput): Promise<ServiceResult<CandidatePayload>> {
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
			candidate.localPartner = { connect: { id: actor.session.id } };
		}

		candidate.program = undefined;

		const paymentInfoCreate = candidate.paymentInformation?.create;
		const paymentPhoneNumber = paymentInfoCreate?.phone?.create?.number;

		try {
			return await this.db.$transaction(async (tx) => {
				const data: CandidateCreateInput = {
					startDate: candidate.startDate ?? null,
					status: candidate.status,
					successorName: candidate.successorName ?? null,
					termsAccepted: candidate.termsAccepted ?? false,

					localPartner: candidate.localPartner,
					contact: candidate.contact,

					paymentInformation:
						paymentInfoCreate && paymentPhoneNumber
							? {
									create: {
										provider: paymentInfoCreate.provider,
										code: paymentInfoCreate.code ?? null,
										phone: {
											create: {
												number: paymentPhoneNumber,
											},
										},
									},
								}
							: undefined,
				};

				const newCandidate = await tx.recipient.create({
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

				if (paymentPhoneNumber) {
					const firebaseResult = await this.firebaseAdminService.createByPhoneNumber(paymentPhoneNumber);
					if (!firebaseResult.success) {
						throw new Error(`Failed to create Firebase user: ${firebaseResult.error}`);
					}
				}

				return this.resultOk(newCandidate);
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
			const partnerId = actor.session.id;
			if (existing.localPartnerId !== partnerId) {
				return this.resultFail('Permission denied');
			}
			delete updateInput.localPartner;
		}

		updateInput.program = undefined;

		const previousPaymentPhoneNumber = existing.paymentInformation?.phone?.number ?? null;

		if (!previousPaymentPhoneNumber && !nextPaymentPhoneNumber) {
			try {
				const updatedCandidate = await this.db.recipient.update({
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
				return this.resultOk(updatedCandidate);
			} catch (error) {
				this.logger.error(error);
				return this.resultFail(`Could not update candidate: ${JSON.stringify(error)}`);
			}
		}

		const phoneAdded = !previousPaymentPhoneNumber && !!nextPaymentPhoneNumber;

		const phoneChanged =
			!!previousPaymentPhoneNumber && !!nextPaymentPhoneNumber && previousPaymentPhoneNumber !== nextPaymentPhoneNumber;

		try {
			if (phoneAdded) {
				const firebaseResult = await this.firebaseAdminService.createByPhoneNumber(nextPaymentPhoneNumber!);
				if (!firebaseResult.success) {
					return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
				}
			}

			if (phoneChanged) {
				const firebaseResult = await this.firebaseAdminService.updateByPhoneNumber(
					previousPaymentPhoneNumber,
					nextPaymentPhoneNumber!,
				);

				if (!firebaseResult.success) {
					return this.resultFail(`Failed to update Firebase user: ${firebaseResult.error}`);
				}
			}

			const updatedCandidate = await this.db.recipient.update({
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

			return this.resultOk(updatedCandidate);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update candidate: ${JSON.stringify(error)}`);
		}
	}

	async delete(actor: Actor, candidateId: string): Promise<ServiceResult<{ id: string }>> {
		const existing = await this.db.recipient.findUnique({
			where: { id: candidateId },
			select: {
				id: true,
				programId: true,
				localPartnerId: true,
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

		if (actor.kind === 'user') {
			const admin = await this.assertAdmin(actor.session.id);
			if (!admin.success) {
				return this.resultFail(admin.error);
			}
		}

		if (actor.kind === 'local-partner') {
			const partnerId = actor.session.id;
			if (existing.localPartnerId !== partnerId) {
				return this.resultFail('Permission denied');
			}
		}

		if (actor.kind === 'contributor') {
			return this.resultFail('Permission denied');
		}

		console.log('Deleting candidate with ID:', candidateId);

		try {
			await this.db.$transaction(async (tx) => {
				console.log('Transaction started for deleting candidate with ID:', candidateId);
				const phone = existing.paymentInformation?.phone?.number;
				console.log('Candidate payment phone number:', phone);
				if (phone) {
					console.log('Deleting Firebase user with phone number:', phone);
					await this.firebaseAdminService.deleteByPhoneNumberIfExists(phone);
				}

				await tx.recipient.delete({
					where: { id: candidateId },
				});
			});

			return this.resultOk({ id: candidateId });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not delete candidate: ${JSON.stringify(error)}`);
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

	async assignRandomCandidatesToProgram(
		programId: string,
		amountOfRecipientsForStart: number,
		countryCode: CountryCode,
		causes?: Cause[],
		profiles?: Profile[],
	): Promise<ServiceResult<{ assigned: number }>> {
		try {
			const where = this.buildCandidateWhere(causes, profiles, countryCode);

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

	async importCsv(actor: Actor, file: File): Promise<ServiceResult<{ created: number }>> {
		let created = 0;

		let rows;
		try {
			const text = await file.text();
			rows = parseCsvText(text);
		} catch (error) {
			return this.resultFail(error instanceof Error ? error.message : 'Failed to parse CSV file');
		}

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const rowNumber = i + 1;

			if (!row.firstName || !row.lastName) {
				return this.resultFail(`Row ${rowNumber}: firstName and lastName are required`);
			}

			if (!row.localPartnerId) {
				return this.resultFail(`Row ${rowNumber}: localPartnerId is required`);
			}

			if (!row.status) {
				return this.resultFail(`Row ${rowNumber}: status is required`);
			}

			const candidate: CandidateCreateInput = {
				status: row.status as RecipientStatus,
				contact: {
					create: {
						firstName: row.firstName,
						lastName: row.lastName,
					},
				},

				localPartner: {
					connect: { id: row.localPartnerId },
				},
			};

			const result = await this.create(actor, candidate);

			if (!result.success) {
				return this.resultFail(`Row ${rowNumber}: ${result.error}`);
			}

			created++;
		}

		return this.resultOk({ created });
	}
}
