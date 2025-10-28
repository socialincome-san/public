import { PayoutStatus, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessService } from '../program-access/program-access.service';
import {
	ProgramMemberTableView,
	ProgramMemberTableViewRow,
	ProgramOption,
	ProgramWallet,
	ProgramWallets,
} from './program.types';

export class ProgramService extends BaseService {
	private programAccessService = new ProgramAccessService();

	async getProgramWallets(userId: string): Promise<ServiceResult<ProgramWallets>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const accessiblePrograms = accessibleProgramsResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ wallets: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);

			const programs = await this.db.program.findMany({
				where: { id: { in: programIds } },
				select: {
					id: true,
					name: true,
					country: true,
					payoutCurrency: true,
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

			const wallets: ProgramWallet[] = programs.map((program) => {
				const permission =
					accessiblePrograms.find((a) => a.programId === program.id)?.permission ?? ProgramPermission.readonly;

				const recipientsCount = program.recipients.length;

				let totalPayoutsSum = 0;
				for (const recipient of program.recipients) {
					for (const payout of recipient.payouts) {
						totalPayoutsSum += Number(payout.amount ?? 0);
					}
				}

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
		} catch {
			return this.resultFail('Could not fetch programs');
		}
	}

	async getProgramWalletsProgramScoped(userId: string, programId: string): Promise<ServiceResult<ProgramWallet>> {
		const base = await this.getProgramWallets(userId);

		if (!base.success) {
			return this.resultFail(base.error);
		}

		const wallet = base.data.wallets.find((w) => w.id === programId);

		if (!wallet) {
			return this.resultFail('Program not found or not accessible');
		}

		return this.resultOk(wallet);
	}

	async getMembersTableView(userId: string, programId: string): Promise<ServiceResult<ProgramMemberTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessible = accessResult.data.find((a) => a.programId === programId);

			if (!accessible) {
				return this.resultFail('User does not have access to this program');
			}

			const myPermission = accessible.permission;

			const accesses = await this.db.programAccess.findMany({
				where: { programId },
				select: {
					user: {
						select: {
							id: true,
							role: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
									email: true,
								},
							},
						},
					},
				},
				orderBy: { user: { contact: { firstName: 'asc' } } },
			});

			const tableRows: ProgramMemberTableViewRow[] = accesses.map((entry) => ({
				id: entry.user.id,
				firstName: entry.user.contact?.firstName ?? '',
				lastName: entry.user.contact?.lastName ?? '',
				email: entry.user.contact?.email ?? '',
				role: entry.user.role ?? null,
				permission: myPermission ?? ProgramPermission.readonly,
			}));

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch program members');
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<ProgramOption[]>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const programs = accessibleProgramsResult.data.map((p) => ({
				id: p.programId,
				name: p.programName,
			}));

			return this.resultOk(programs);
		} catch {
			return this.resultFail('Could not fetch program options');
		}
	}
}
