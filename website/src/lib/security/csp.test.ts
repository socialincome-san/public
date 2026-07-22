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

	const withEmulatorEnv = <T>(run: () => T): T => {
		const previous = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
		process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL = 'http://localhost:9099';

		try {
			return run();
		} finally {
			if (previous === undefined) {
				delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
			} else {
				process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL = previous;
			}
		}
	};

	const withoutEmulatorEnv = <T>(run: () => T): T => {
		const previous = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
		delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;

		try {
			return run();
		} finally {
			if (previous === undefined) {
				delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
			} else {
				process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL = previous;
			}
		}
	};

	test('production policy includes all required directives without unsafe-eval', () => {
		withoutEmulatorEnv(() => {
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
	});

	test('development policy adds unsafe-eval and localhost connect sources', () => {
		withoutEmulatorEnv(() => {
			const policy = buildContentSecurityPolicy({ isDevelopment: true });

			expect(policy).toContain("'unsafe-eval'");
			expect(policy).toContain('http://localhost:*');
			expect(policy).toContain('ws://localhost:*');
		});
	});

	test('production policy allowlists critical third-party origins', () => {
		withoutEmulatorEnv(() => {
			const policy = buildContentSecurityPolicy({ isDevelopment: false });

			expect(policy).toContain('https://js.stripe.com');
			expect(policy).toContain('https://checkout.stripe.com');
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

	test('emulator policy allows localhost connect sources without upgrade-insecure-requests', () => {
		withEmulatorEnv(() => {
			const policy = buildContentSecurityPolicy({ isDevelopment: false });

			expect(policy).toContain('http://localhost:*');
			expect(policy).toContain('http://127.0.0.1:*');
			expect(policy).toContain('ws://localhost:*');
			expect(policy).toContain('ws://127.0.0.1:*');
			expect(policy).not.toContain('upgrade-insecure-requests');
		});
	});
});
