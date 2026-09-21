import { resultFail, resultOk } from '@/lib/service-result';

const mockSearchSendgridNewsletterContact = jest.fn();
const mockUpsertSendgridNewsletterSubscription = jest.fn();

jest.mock('@/integrations/sendgrid/sendgrid-subscription.integration', () => ({
	searchSendgridNewsletterContact: mockSearchSendgridNewsletterContact,
	upsertSendgridNewsletterSubscription: mockUpsertSendgridNewsletterSubscription,
}));

import { getActiveNewsletterSubscription, subscribeToNewsletter, unsubscribeFromNewsletter } from './newsletter.service';

describe('newsletter service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUpsertSendgridNewsletterSubscription.mockResolvedValue(resultOk(undefined));
	});

	test('requires an email to read the active subscription', async () => {
		await expect(getActiveNewsletterSubscription(null)).resolves.toEqual(resultFail('Email missing in contributor'));
	});

	test('returns the active newsletter contact', async () => {
		mockSearchSendgridNewsletterContact.mockResolvedValue(resultOk({ email: 'ada@example.com', status: 'subscribed' }));

		await expect(getActiveNewsletterSubscription('ada@example.com')).resolves.toEqual(
			resultOk({ email: 'ada@example.com', status: 'subscribed' }),
		);
	});

	test('subscribes a contact through SendGrid', async () => {
		await expect(
			subscribeToNewsletter({
				email: 'ada@example.com',
				language: 'en',
				firstname: 'Ada',
			}),
		).resolves.toEqual(resultOk(undefined));
		expect(mockUpsertSendgridNewsletterSubscription).toHaveBeenCalledWith({
			email: 'ada@example.com',
			language: 'en',
			firstname: 'Ada',
			status: 'subscribed',
		});
	});

	test('unsubscribes a contributor and defaults missing language and country', async () => {
		await expect(
			unsubscribeFromNewsletter({
				email: 'ada@example.com',
				firstName: 'Ada',
				lastName: 'Lovelace',
			}),
		).resolves.toEqual(resultOk(undefined));
		expect(mockUpsertSendgridNewsletterSubscription).toHaveBeenCalledWith({
			firstname: 'Ada',
			lastname: 'Lovelace',
			email: 'ada@example.com',
			language: 'de',
			country: 'CH',
			status: 'unsubscribed',
		});
	});
});
