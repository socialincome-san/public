import { PrismaClient } from '@/generated/prisma/client';
import { BaseService } from '../../../core/base.service';
import { ServiceResult } from '../../../core/base.types';
import { UserReadService } from '../../../user/user-read.service';
import { isPhoneSourceAllowed, PAYMENT_PHONE_ONLY_FOR_RECIPIENTS } from '../recipients/phone-source';
import { MessagingRecipientsService } from '../recipients/recipients.service';
import type { MessagingTarget } from '../recipients/recipients.types';
import { resolveChannel } from './channel-resolver';
import type { ChannelPreviewInput, ChannelPreviewSummary } from './dispatch.types';

export class MessagingChannelPreviewService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly recipientsService: MessagingRecipientsService,
	) {
		super(db);
	}

	async previewSelection(input: ChannelPreviewInput, currentUserId: string): Promise<ServiceResult<ChannelPreviewSummary>> {
		const admin = await this.userService.isAdmin(currentUserId);
		if (!admin.success) {
			return this.resultFail(admin.error);
		}
		if (!isPhoneSourceAllowed(input.recipientType, input.phoneSource)) {
			return this.resultFail(PAYMENT_PHONE_ONLY_FOR_RECIPIENTS);
		}

		let targets: MessagingTarget[];
		try {
			targets = await this.recipientsService.resolveTargets(
				input.recipientType,
				input.selection,
				input.phoneSource,
				input.phoneFallbackAllowed,
				currentUserId,
			);
		} catch (error) {
			return this.resultFail(error instanceof Error ? error.message : 'Failed to preview channel');
		}

		let primary = 0;
		let fallback = 0;
		let skippedNoPhone = 0;
		for (const target of targets) {
			const r = resolveChannel({
				requested: input.channel,
				phoneNumber: target.phone?.number ?? null,
				hasWhatsApp: target.phone?.hasWhatsApp ?? false,
			});
			if (r.skippedReason === 'no_phone') {
				skippedNoPhone += 1;
			} else if (r.fellBack) {
				fallback += 1;
			} else {
				primary += 1;
			}
		}

		return this.resultOk({ total: targets.length, primary, fallback, skippedNoPhone });
	}
}
