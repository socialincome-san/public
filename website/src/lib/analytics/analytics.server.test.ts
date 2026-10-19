jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('@next/third-parties/google', () => ({ sendGTMEvent: jest.fn() }));

process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-TEST';
process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';

// Required after setting the env variables, which the module reads on load.
const { registerFirstPartyGoogleTag } = jest.requireActual<typeof import('./analytics')>('./analytics');

describe('registerFirstPartyGoogleTag on the server', () => {
	it('does nothing without window', () => {
		expect(() => registerFirstPartyGoogleTag()).not.toThrow();
	});
});
