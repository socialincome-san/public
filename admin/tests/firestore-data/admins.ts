import firebase from 'firebase/compat/app';
import { doc, setDoc } from 'firebase/firestore';

export const populateAdminsCollection = async (firestore: firebase.firestore.Firestore) => {
	const admins = {
		'test_admin@socialincome.org': {
			name: 'Test Admin',
			is_global_admin: true,
		},
		'test_analyst@socialincome.org': {
			name: 'Test Analyst',
			is_global_analyst: true,
		},
		'admin@test-organisation-1.org': {
			name: 'Test Organisation Admin',
			is_global_admin: false,
			is_global_analyst: false,
			organisations: [doc(firestore, 'organisations', 'test-organisation-1')],
		},
	};

	for (const [documentId, admin] of Object.entries(admins)) {
		await setDoc(doc(firestore, 'admins', documentId), admin);
	}
};
