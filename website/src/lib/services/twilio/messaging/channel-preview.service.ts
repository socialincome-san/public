import { MessagingChannel, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../../core/base.service';
import { ServiceResult } from '../../core/base.types';
import { UserReadService } from '../../user/user-read.service';
import { resolveChannel } from './channel-resolver';
import type { ChannelPreviewSummary } from './twilio-messaging.types';

export class MessagingChannelPreviewService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async previewByContactIds(
		contactIds: string[],
		channel: MessagingChannel,
		currentUserId: string,
	): Promise<ServiceResult<ChannelPreviewSummary>> {
		const admin = await this.userService.isAdmin(currentUserId);
		if (!admin.success) {
			return this.resultFail(admin.error);
		}

		const contacts = await this.db.contact.findMany({
			where: { id: { in: contactIds } },
			select: { id: true, phone: { select: { number: true, hasWhatsApp: true } } },
		});

		let primary = 0;
		let fallback = 0;
		let skippedNoPhone = 0;
		for (const c of contacts) {
			const r = resolveChannel({
				requested: channel,
				phoneNumber: c.phone?.number ?? null,
				hasWhatsApp: c.phone?.hasWhatsApp ?? false,
			});
			if (r.skippedReason === 'no_phone') {
				skippedNoPhone += 1;
			} else if (r.fellBack) {
				fallback += 1;
			} else {
				primary += 1;
			}
		}

		return this.resultOk({ total: contacts.length, primary, fallback, skippedNoPhone });
	}
}
