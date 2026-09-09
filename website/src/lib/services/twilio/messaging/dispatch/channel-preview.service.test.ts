import type { MessagingTarget } from '../recipients/recipients.types';
import { MessagingChannelPreviewService } from './channel-preview.service';
import type { ChannelPreviewInput } from './dispatch.types';

function makeService(opts: { targets: MessagingTarget[]; isAdmin?: boolean; resolveError?: string }) {
	const userService = {
		isAdmin: jest.fn(() =>
			Promise.resolve(
				opts.isAdmin === false
					? { success: false as const, error: 'Permission denied' }
					: { success: true as const, data: true as const },
			),
		),
	};
	const recipientsService = {
		resolveTargets: jest.fn(() =>
			opts.resolveError ? Promise.reject(new Error(opts.resolveError)) : Promise.resolve(opts.targets),
		),
	};

	return {
		service: new MessagingChannelPreviewService({} as never, userService as never, recipientsService as never),
		recipientsService,
	};
}

const target = (contactId: string, phone: MessagingTarget['phone']): MessagingTarget => ({ contactId, phone });

const selection = { mode: 'include', ids: new Set(['r1', 'r2', 'r3']) } as const;

const input = (overrides: Partial<ChannelPreviewInput> = {}): ChannelPreviewInput => ({
	recipientType: 'recipient',
	selection,
	channel: 'whatsapp',
	phoneSource: 'contact',
	phoneFallbackAllowed: false,
	...overrides,
});

describe('MessagingChannelPreviewService.previewSelection', () => {
	test('whatsapp channel: 1 primary, 1 fallback, 1 skipped', async () => {
		const { service } = makeService({
			targets: [
				target('a', { number: '+1', hasWhatsApp: true }),
				target('b', { number: '+2', hasWhatsApp: false }),
				target('c', null),
			],
		});
		const r = await service.previewSelection(input(), 'user1');
		expect(r.success).toBe(true);
		expect(r.success && r.data).toEqual({ total: 3, primary: 1, fallback: 1, skippedNoPhone: 1 });
	});

	test('sms channel: all primary, none fallback', async () => {
		const { service } = makeService({
			targets: [
				target('a', { number: '+1', hasWhatsApp: false }),
				target('b', { number: '+2', hasWhatsApp: true }),
				target('c', null),
			],
		});
		const r = await service.previewSelection(input({ channel: 'sms' }), 'user1');
		expect(r.success && r.data).toEqual({ total: 3, primary: 2, fallback: 0, skippedNoPhone: 1 });
	});

	test('passes the phone choice through to target resolution', async () => {
		const { service, recipientsService } = makeService({ targets: [] });
		await service.previewSelection(input({ phoneSource: 'payment', phoneFallbackAllowed: true }), 'user1');
		expect(recipientsService.resolveTargets).toHaveBeenCalledWith('recipient', selection, 'payment', true, 'user1');
	});

	test('non-admin is rejected before targets are resolved', async () => {
		const { service, recipientsService } = makeService({ targets: [], isAdmin: false });
		const r = await service.previewSelection(input(), 'user1');
		expect(r.success).toBe(false);
		expect(recipientsService.resolveTargets).not.toHaveBeenCalled();
	});

	test('payment phone with a non-recipient type is rejected', async () => {
		const { service, recipientsService } = makeService({ targets: [] });
		const r = await service.previewSelection(input({ recipientType: 'contributor', phoneSource: 'payment' }), 'user1');
		expect(r.success).toBe(false);
		expect(!r.success && r.error).toBe('Payment phone is only available for recipients');
		expect(recipientsService.resolveTargets).not.toHaveBeenCalled();
	});

	test('a resolution error is returned as a failure with its message', async () => {
		const { service } = makeService({ targets: [], resolveError: 'Program not found' });
		const r = await service.previewSelection(input(), 'user1');
		expect(r.success).toBe(false);
		expect(!r.success && r.error).toBe('Program not found');
	});
});
