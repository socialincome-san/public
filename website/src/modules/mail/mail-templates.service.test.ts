import { renderNotification } from './mail-templates.service';

const campaign = { id: 'campaign-1', slug: 'my-campaign', title: 'My Campaign', storyId: 42 };

describe('renderNotification', () => {
	test('renders the campaign created email', () => {
		const result = renderNotification({
			type: 'campaign-created',
			data: {
				...campaign,
				creatorName: 'Alex Creator',
				goal: 5000,
				currency: 'CHF',
				endDate: new Date('2027-01-31T00:00:00.000Z'),
				public: true,
				hasAccount: false,
			},
		});

		expect(result.success).toBe(true);
		const email = result.success ? result.data : null;
		expect(email?.subject).toBe('Campaign created: My Campaign');
		expect(email?.text).toContain('Alex Creator created the campaign "My Campaign"');
		expect(email?.text).toContain('once it is approved in Storyblok');
		expect(email?.text).toContain('Goal: CHF 5000');
		expect(email?.text).toContain('Ends: 2027-01-31');
		expect(email?.text).toContain('The creator has no account yet');
		expect(email?.text).toContain('/stories/0/0/42');
	});

	test('says when a created campaign is private and has no goal', () => {
		const result = renderNotification({
			type: 'campaign-created',
			data: {
				...campaign,
				creatorName: 'Alex Creator',
				goal: null,
				currency: 'CHF',
				endDate: new Date('2027-01-31T00:00:00.000Z'),
				public: false,
				hasAccount: true,
			},
		});

		const text = result.success ? result.data.text : '';
		expect(text).toContain('It is private and will not be listed.');
		expect(text).toContain('Goal: none');
		expect(text).not.toContain('no account yet');
	});

	test('renders the campaign edited email', () => {
		const result = renderNotification({
			type: 'campaign-edited',
			data: {
				...campaign,
				editorName: 'Ada',
				changedFields: ['title', 'goal'],
				hadUnpublishedChanges: true,
			},
		});

		const email = result.success ? result.data : null;
		expect(email?.subject).toBe('Campaign edited: My Campaign');
		expect(email?.text).toContain('Ada edited the campaign "My Campaign"');
		expect(email?.text).toContain('Changed: title, goal');
		expect(email?.text).toContain('unpublished changes');
	});
});
