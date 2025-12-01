import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { credential } from 'firebase-admin';
import { AppOptions } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';

export class FirebaseAuthService {
	private readonly auth: Auth;

	constructor() {
		const app = getOrInitializeFirebaseAdmin(this.buildFirebaseOptions(), 'auth-target');
		this.auth = getAuth(app);
	}

	private buildFirebaseOptions(): AppOptions {
		// Use target-specific emulator env var so extractor (source) isn't affected
		const targetEmulator = process.env.TARGET_FIREBASE_AUTH_EMULATOR_HOST;
		if (targetEmulator) {
			// Set standard SDK var so firebase-admin connects to the emulator
			process.env.FIREBASE_AUTH_EMULATOR_HOST = targetEmulator;
			const projectId = process.env.TARGET_FIREBASE_PROJECT_ID;
			if (!projectId) {
				throw new Error('TARGET_FIREBASE_PROJECT_ID must be set when using target auth emulator.');
			}
			return { projectId, credential: credential.applicationDefault() } as AppOptions;
		}

		const { TARGET_FIREBASE_SERVICE_ACCOUNT_JSON, TARGET_FIREBASE_DATABASE_URL } = process.env;

		if (!TARGET_FIREBASE_SERVICE_ACCOUNT_JSON || !TARGET_FIREBASE_DATABASE_URL) {
			throw new Error('TARGET_FIREBASE_SERVICE_ACCOUNT_JSON and TARGET_FIREBASE_DATABASE_URL must be set.');
		}

		const decoded = Buffer.from(TARGET_FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8');
		const serviceAccount = JSON.parse(decoded);

		return {
			credential: credential.cert(serviceAccount),
			databaseURL: TARGET_FIREBASE_DATABASE_URL,
			projectId: serviceAccount.project_id,
		};
	}

	async createOrGetUser(email: string, displayName?: string): Promise<{ uid: string; created: boolean }> {
		try {
			const user = await this.auth.createUser({
				email,
				displayName,
			});

			return { uid: user.uid, created: true };
		} catch (err: unknown) {
			const code =
				typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: unknown }).code : undefined;
			if (code === 'auth/email-already-exists') {
				const existing = await this.auth.getUserByEmail(email);
				return { uid: existing.uid, created: false };
			}
			throw err;
		}
	}

	async deleteAllUsers(): Promise<{ deletedCount: number }> {
		const result = await this.auth.listUsers(1); // DANGER ZONE: Increase page size to delete more users at once

		const uids = result.users.map((u) => u.uid);

		if (uids.length === 0) {
			return { deletedCount: 0 };
		}

		await this.auth.deleteUsers(uids);

		return { deletedCount: uids.length };
	}
}
