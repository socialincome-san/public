import { HttpsFunction } from 'firebase-functions/lib/v1/cloud-functions';
import { AuthAdmin } from '../../shared/src/firebase/AuthAdmin';
import { FirestoreAdmin } from '../../shared/src/firebase/FirestoreAdmin';
import { StorageAdmin } from '../../shared/src/firebase/StorageAdmin';
import { getOrInitializeFirebaseAdmin } from '../../shared/src/firebase/app';

export interface FunctionProvider {
	getFunction: () => HttpsFunction;
}

interface AbstractFirebaseFunctionProps {
	firestoreAdmin?: FirestoreAdmin;
	storageAdmin?: StorageAdmin;
	authAdmin?: AuthAdmin;
}

export abstract class AbstractFirebaseAdmin {
	protected readonly firestoreAdmin: FirestoreAdmin;
	protected readonly storageAdmin: StorageAdmin;
	protected readonly authAdmin: AuthAdmin;

	constructor(props?: AbstractFirebaseFunctionProps) {
		this.firestoreAdmin = props?.firestoreAdmin ?? new FirestoreAdmin(getOrInitializeFirebaseAdmin());
		this.storageAdmin = props?.storageAdmin ?? new StorageAdmin(getOrInitializeFirebaseAdmin());
		this.authAdmin = props?.authAdmin ?? new AuthAdmin(getOrInitializeFirebaseAdmin());
	}
}
