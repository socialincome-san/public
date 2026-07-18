import { MessagingChannelPreviewService } from './channel-preview.service';

function makeService(opts: {
	contacts: { id: string; phone: { number: string; hasWhatsApp: boolean } | null }[];
	isAdmin?: boolean;
}) {
	const db = {
		contact: {
			findMany: async () => opts.contacts.map((c) => ({ id: c.id, phone: c.phone })),
		},
	};
	const userService = {
		isAdmin: jest.fn(async () =>
			opts.isAdmin === false
				? { success: false as const, error: 'Permission denied' }
				: { success: true as const, data: true as const },
		),
	};

	return new MessagingChannelPreviewService(db as never, userService as never);
}

describe('MessagingChannelPreviewService.previewByContactIds', () => {
	test('whatsapp channel: 1 primary, 1 fallback, 1 skipped', async () => {
		const svc = makeService({
			contacts: [
				{ id: 'a', phone: { number: '+1', hasWhatsApp: true } },
				{ id: 'b', phone: { number: '+2', hasWhatsApp: false } },
				{ id: 'c', phone: null },
			],
		});
		const r = await svc.previewByContactIds(['a', 'b', 'c'], 'whatsapp', 'user1');
		expect(r.success).toBe(true);
		expect(r.success && r.data).toEqual({ total: 3, primary: 1, fallback: 1, skippedNoPhone: 1 });
	});

	test('sms channel: all primary, none fallback', async () => {
		const svc = makeService({
			contacts: [
				{ id: 'a', phone: { number: '+1', hasWhatsApp: false } },
				{ id: 'b', phone: { number: '+2', hasWhatsApp: true } },
				{ id: 'c', phone: null },
			],
		});
		const r = await svc.previewByContactIds(['a', 'b', 'c'], 'sms', 'user1');
		expect(r.success && r.data).toEqual({ total: 3, primary: 2, fallback: 0, skippedNoPhone: 1 });
	});

	test('non-admin rejected', async () => {
		const svc = makeService({ contacts: [], isAdmin: false });
		const r = await svc.previewByContactIds([], 'sms', 'user1');
		expect(r.success).toBe(false);
	});
});
