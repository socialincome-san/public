import { App } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';

export class AuthAdmin {
	/**
	 * direct access to the auth instance.
	 */
	readonly auth: Auth;

	constructor(app: App) {
		this.auth = getAuth(app);
	}
}
