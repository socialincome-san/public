import { PayoutStatus, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramWallet, ProgramWalletView } from './program.types';

export class ProgramService extends BaseService {
	async getProgramWalletView(userId: string): Promise<ServiceResult<ProgramWalletView>> {
		const authResult = await this.requireUser(userId);
		if (!authResult.success) {
			return this.resultFail(authResult.error, authResult.status);
		}

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
}
