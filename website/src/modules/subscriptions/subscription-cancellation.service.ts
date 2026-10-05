import type { SubscriptionCancellationReason } from '@/generated/prisma/enums';

export const subscriptionCancellation = {
	mapReasonToStripeFeedback: (
		reason: SubscriptionCancellationReason,
	): 'too_expensive' | 'switched_service' | 'missing_features' | 'unused' | 'other' => {
		switch (reason) {
			case 'financial_situation_changed':
				return 'too_expensive';
			case 'different_cause':
				return 'switched_service';
			case 'not_enough_updates':
				return 'missing_features';
			case 'pausing':
				return 'unused';
			case 'technical_issue':
			case 'prefer_one_time':
			case 'other':
				return 'other';
		}
	},
};
