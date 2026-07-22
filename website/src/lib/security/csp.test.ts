import { buildContentSecurityPolicy } from '../../../csp';

describe('buildContentSecurityPolicy', () => {
	const requiredDirectives = [
		'default-src',
		'script-src',
		'style-src',
		'img-src',
		'font-src',
		'connect-src',
		'frame-src',
		'media-src',
		'worker-src',
		'form-action',
		'frame-ancestors',
		'object-src',
		'base-uri',
		'upgrade-insecure-requests',
	];

	test('production policy includes all required directives without unsafe-eval', () => {
		const policy = buildContentSecurityPolicy({ isDevelopment: false });

		for (const directive of requiredDirectives) {
			if (directive === 'upgrade-insecure-requests') {
				expect(policy.endsWith('upgrade-insecure-requests')).toBe(true);
				continue;
			}

			expect(policy).toContain(`${directive} `);
		}

		expect(policy).not.toContain("'unsafe-eval'");
		expect(policy).not.toContain('http://localhost:*');
		expect(policy).not.toContain('ws://localhost:*');
	});

	test('development policy adds unsafe-eval and localhost connect sources', () => {
		const policy = buildContentSecurityPolicy({ isDevelopment: true });

		expect(policy).toContain("'unsafe-eval'");
		expect(policy).toContain('http://localhost:*');
		expect(policy).toContain('ws://localhost:*');
	});

	test('production policy allowlists critical third-party origins', () => {
		const policy = buildContentSecurityPolicy({ isDevelopment: false });

		expect(policy).toContain('https://js.stripe.com');
		expect(policy).toContain('https://www.googletagmanager.com');
		expect(policy).toContain('https://connect.facebook.net');
		expect(policy).toContain('https://snap.licdn.com');
		expect(policy).toContain('https://identitytoolkit.googleapis.com');
		expect(policy).toContain('https://o4507045017026560.ingest.us.sentry.io');
		expect(policy).toContain('https://stream.mux.com');
		expect(policy).toContain('https://app.storyblok.com');
		expect(policy).toContain('https://player.mux.com');
	});
});
