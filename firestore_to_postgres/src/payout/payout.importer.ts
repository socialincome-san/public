import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';
import { CreatePayoutInput } from '@socialincome/shared/src/database/services/payout/payout.types';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { BaseImporter } from '../core/base.importer';
import { PayoutWithEmail } from './payout.transformer';

type EmailRecipientMap = Map<string, string>;

export class PayoutsImporter extends BaseImporter<PayoutWithEmail[]> {
	private readonly payoutService = new PayoutService();
	private readonly userService = new UserService();
	private readonly recipientService = new RecipientService();

	private emailRecipientMap: EmailRecipientMap = new Map();

	import = async (payoutBatches: PayoutWithEmail[][]): Promise<number> => {
		await this.buildRecipientMap();

		let createdCount = 0;

		for (const payouts of payoutBatches) {
			for (const { recipientEmail, ...payout } of payouts) {
				const recipientId = this.getRecipientId(recipientEmail);
				if (!recipientId) {
					console.warn(`[PayoutsImporter] Skipped payout: No recipient for email "${recipientEmail}"`);
					continue;
				}

				const result = await this.payoutService.create({
					...payout,
					recipientId,
				} as CreatePayoutInput);

				if (result.success) {
					createdCount++;
				} else {
					console.warn(`[PayoutsImporter] Failed to create payout for ${recipientEmail}: ${result.error}`);
				}
			}
		}

		return createdCount;
	};

	private async buildRecipientMap() {
		const userResult = await this.userService.findMany();
		if (!userResult.success || !userResult.data) {
			throw new Error('❌ Failed to fetch users');
		}

		const recipientResult = await this.recipientService.getAll();
		if (!recipientResult.success || !recipientResult.data) {
			throw new Error('❌ Failed to fetch recipients');
		}

		const userIdToEmailMap = new Map(userResult.data.map((user) => [user.id, user.email.toLowerCase()]));

		for (const recipient of recipientResult.data) {
			const email = userIdToEmailMap.get(recipient.userId);
			if (email) {
				this.emailRecipientMap.set(email, recipient.id);
			}
		}
	}

	private getRecipientId(email: string): string | null {
		return this.emailRecipientMap.get(email.toLowerCase()) ?? null;
	}
}
