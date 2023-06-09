import { HttpsFunction } from 'firebase-functions/lib/v1/cloud-functions';
import { getOrInitializeApp } from '../../shared/src/firebase/app';
import { AuthAdmin } from '../../shared/src/firebase/AuthAdmin';
import { FirestoreAdmin } from '../../shared/src/firebase/FirestoreAdmin';
import { StorageAdmin } from '../../shared/src/firebase/StorageAdmin';

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
		this.firestoreAdmin = props?.firestoreAdmin ?? new FirestoreAdmin(getOrInitializeApp());
		this.storageAdmin = props?.storageAdmin ?? new StorageAdmin(getOrInitializeApp());
		this.authAdmin = props?.authAdmin ?? new AuthAdmin(getOrInitializeApp());
	}
}
