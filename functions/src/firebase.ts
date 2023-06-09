import { getOrInitializeApp } from '@socialincome/shared/src/firebase/app';
import { AuthAdmin } from '@socialincome/shared/src/firebase/AuthAdmin';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/FirestoreAdmin';
import { StorageAdmin } from '@socialincome/shared/src/firebase/StorageAdmin';
import { HttpsFunction } from 'firebase-functions/lib/v1/cloud-functions';

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
