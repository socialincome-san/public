import { getOrInitializeFirebaseAdmin } from '../../shared/src/firebase/admin/app';
import { AuthAdmin } from '../../shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '../../shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '../../shared/src/firebase/admin/StorageAdmin';
import {
	ADMIN_USER_FIRESTORE_PATH,
	AdminUser,
	PARTNER_ORGANISATION_FIRESTORE_PATH,
	PartnerOrganisation,
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	RecipientProgramStatus,
} from '../../shared/src/types';

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
		this.firestoreAdmin = props?.firestoreAdmin ?? new FirestoreAdmin();
		this.storageAdmin = props?.storageAdmin ?? new StorageAdmin();
		this.authAdmin = props?.authAdmin ?? new AuthAdmin();
	}
}

export async function initializeGlobalTestData(projectId?: string) {
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId }));

	await firestoreAdmin.doc<AdminUser>(ADMIN_USER_FIRESTORE_PATH, 'admin@socialincome.org').set({
		name: 'Admin',
		is_global_admin: true,
	});

	await firestoreAdmin.doc<PartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH, 'aurora').set({
		name: 'Aurora',
		contactName: 'Contact Person',
		contactNumber: '002020203020',
	});

	await firestoreAdmin.doc<Recipient>(RECIPIENT_FIRESTORE_PATH).set({
		gender: 'male',
		organisation: 'organisations/aurora',
		progr_status: RecipientProgramStatus.Former,
		birth_date: new Date(2001, 0, 1),
		first_name: 'Test1',
		last_name: 'User1',
		om_uid: 1,
		mobile_money_phone: {
			phone: 25000051,
			has_whatsapp: false,
		},
	});

	await firestoreAdmin.doc<Recipient>(RECIPIENT_FIRESTORE_PATH).set({
		gender: 'female',
		organisation: 'organisations/aurora',
		progr_status: RecipientProgramStatus.Active,
		birth_date: new Date(2001, 0, 2),
		first_name: 'Test2',
		last_name: 'User2',
		om_uid: 2,
		mobile_money_phone: {
			phone: 25000052,
			has_whatsapp: false,
		},
	});

	await firestoreAdmin.doc<Recipient>(RECIPIENT_FIRESTORE_PATH).set({
		gender: 'female',
		organisation: 'organisations/aurora',
		progr_status: RecipientProgramStatus.Active,
		birth_date: new Date(2001, 0, 3),
		first_name: 'Test3',
		last_name: 'User3',
		om_uid: 3,
		mobile_money_phone: {
			phone: 25000053,
			has_whatsapp: false,
		},
	});

	await firestoreAdmin.doc<Recipient>(RECIPIENT_FIRESTORE_PATH, '3RqjohcNgUXaejFC7av8').set({
		gender: 'female',
		organisation: 'organisations/aurora',
		progr_status: RecipientProgramStatus.Designated,
		birth_date: new Date(2001, 0, 4),
		first_name: 'Test4',
		last_name: 'User4',
		om_uid: 4,
		mobile_money_phone: {
			phone: 25000054,
			has_whatsapp: false,
		},
	});

	await firestoreAdmin.doc<Recipient>(RECIPIENT_FIRESTORE_PATH).set({
		gender: 'male',
		organisation: 'organisations/aurora',
		progr_status: RecipientProgramStatus.Waitlisted,
		birth_date: new Date(2001, 0, 5),
		first_name: 'Test5',
		last_name: 'User5',
	});
}
