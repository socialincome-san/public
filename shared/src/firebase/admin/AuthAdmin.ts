import { App } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { getOrInitializeFirebaseAdmin } from './app';

export class AuthAdmin {
	/**
	 * direct access to the auth instance.
	 */
	readonly auth: Auth;

	constructor(app?: App) {
		app = app ? app : getOrInitializeFirebaseAdmin();
		this.auth = getAuth(app);
	}
}
