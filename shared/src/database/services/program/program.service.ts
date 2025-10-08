import { PayoutStatus, Program, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateProgramInput, ProgramWallet, ProgramWalletView } from './program.types';

export class ProgramService extends BaseService {
	async create(input: CreateProgramInput): Promise<ServiceResult<Program>> {
		try {
			const existing = await this.findProgramByName(input.name);
			if (existing) return this.resultFail('Program with this title already exists');

			const program = await this.db.program.create({ data: input });
			return this.resultOk(program);
		} catch {
			return this.resultFail('Could not create program');
		}
	}

	async findProgramByName(name: string): Promise<Program | null> {
		return this.db.program.findFirst({ where: { name } });
	}

	async getProgramWalletView(userId: string): Promise<ServiceResult<ProgramWalletView>> {
		try {
			const programs = await this.db.program.findMany({
				where: {
					accesses: {
						some: { userId },
					},
				},
				select: {
					id: true,
					name: true,
					country: true,
					payoutCurrency: true,
					accesses: { where: { userId }, select: { permissions: true } },
					recipients: {
						select: {
							payouts: {
								where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
								select: { amount: true },
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const wallets: ProgramWallet[] = [];

			for (const program of programs) {
				const recipientsCount = program.recipients.length;

				let totalPayoutsSum = 0;
				for (const recipient of program.recipients) {
					for (const payout of recipient.payouts) {
						totalPayoutsSum += Number(payout.amount ?? 0);
					}
				}

				const permissions = program.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes(ProgramPermission.edit)
					? ProgramPermission.edit
					: ProgramPermission.readonly;

				wallets.push({
					id: program.id,
					programName: program.name,
					country: program.country,
					payoutCurrency: program.payoutCurrency,
					recipientsCount,
					totalPayoutsSum,
					permission,
				});
			}

			return this.resultOk({ wallets });
		} catch {
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
			const access = await this.db.programAccess.findFirst({
				where: { userId, programId },
				select: { permissions: true },
			});

			if (!access) return this.resultFail('No access found for user');

			const permissions = access.permissions ?? [];
			const permission: ProgramPermission = permissions.includes(ProgramPermission.edit)
				? ProgramPermission.edit
				: ProgramPermission.readonly;

			return this.resultOk(permission);
		} catch {
			return this.resultFail('Could not fetch program permission');
		}
	}
}
