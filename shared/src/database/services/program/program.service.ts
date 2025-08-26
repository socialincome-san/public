import { PayoutStatus, Program as PrismaProgram, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateProgramInput, ProgramPermission, ProgramWallet, ProgramWalletView } from './program.types';

export class ProgramService extends BaseService {
	async create(input: CreateProgramInput): Promise<ServiceResult<PrismaProgram>> {
		try {
			const existing = await this.findProgramByName(input.name);
			if (existing) return this.resultFail('Program with this title already exists');

			const program = await this.db.program.create({ data: input });
			return this.resultOk(program);
		} catch (e) {
			console.error('[ProgramService.create]', e);
			return this.resultFail('Could not create program');
		}
	}

	async findProgramByName(name: string): Promise<PrismaProgram | null> {
		return this.db.program.findFirst({ where: { name } });
	}

	async getProgramWalletView(userId: string): Promise<ServiceResult<ProgramWalletView>> {
		try {
			const programs = await this.db.program.findMany({
				where: this.userAccessibleProgramsWhere(userId),
				select: {
					id: true,
					name: true,
					country: true,
					payoutCurrency: true,
					operatorOrganization: {
						select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
					},
					viewerOrganization: {
						select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
					},
					recipients: {
						where: { status: { in: [RecipientStatus.active, RecipientStatus.designated] } },
						select: {
							id: true,
							payouts: {
								where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
								select: { amount: true },
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const wallets: ProgramWallet[] = programs.map((program) => {
				const recipientsCount = program.recipients.length;

				let totalPayoutsSum = 0;
				for (const recipient of program.recipients) {
					for (const payout of recipient.payouts) {
						totalPayoutsSum += payout.amount ?? 0;
					}
				}

				const isOperator = (program.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = isOperator ? 'operator' : 'viewer';

				return {
					id: program.id,
					programName: program.name,
					country: program.country,
					payoutCurrency: program.payoutCurrency,
					recipientsCount,
					totalPayoutsSum,
					permission,
				};
			});

			return this.resultOk({ wallets });
		} catch (error) {
			console.error('[ProgramService.getProgramWalletView]', error);
			return this.resultFail('Could not fetch programs');
		}
	}

	async getProgramWalletViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<ProgramWallet>> {
		const base = await this.getProgramWalletView(userId);
		if (!base.success) return this.resultFail(base.error);

		const wallet = base.data.wallets.find((w) => w.id === programId);
		if (!wallet) return this.resultFail('Program not found or not accessible');

		return this.resultOk(wallet);
	}

	async getProgramPermissionForUser(userId: string, programId: string): Promise<ServiceResult<ProgramPermission>> {
		try {
			const program = await this.db.program.findFirst({
				where: { id: programId },
				select: {
					operatorOrganization: {
						select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
					},
					viewerOrganization: {
						select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
					},
				},
			});

			if (!program) return this.resultFail('Program not found');

			const isOperator = (program.operatorOrganization?.users?.length ?? 0) > 0;
			const permission: ProgramPermission = isOperator ? 'operator' : 'viewer';

			return this.resultOk(permission);
		} catch (error) {
			console.error('[RecipientService.getProgramPermissionForUser]', error);
			return this.resultFail('Could not fetch program permission');
		}
	}
}
