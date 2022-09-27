import firebase from 'firebase/compat/app';
import { collection, setDoc, doc, getDocs, query, where, Firestore, getDoc } from 'firebase/firestore';

export const populateRecipientsCollection = async (firestore: firebase.firestore.Firestore) => {
	const recipients = {
		P0OHM3bzrT9Kn3je6G55: {
			email: 'dummy@test.com',
			organisation: doc(firestore, 'organisations', 'test-organisation-1'),
			is_suspended: false,
			profession: 'Chaos Creator',
			main_language: 'Krio',
			birth_date: {
				_seconds: 1654380000,
				_nanoseconds: 0,
			},
			speaks_english: true,
			om_uid: 424242,
			calling_name: 'Test',
			first_name: 'Dummy',
			progr_status: 'waitlisted',
			recommended_by: 'social_income',
			im_link: 'https://google.com',
			communication_mobile_phone: {
				equals_mobile_money: false,
				has_whatsapp: true,
				phone: 23271118887,
			},
			last_name: 'Sarveshy',
			test_recipient: true,
			gender: 'male',
			num_payment_months: 36,
		},
		L0OHM3bzrT9Kn3je1111: {
			organisation: doc(firestore, 'organisations', 'test-organisation-2'),
			is_suspended: false,
			email: 'dummy@test.com',
			profession: 'Chaos Creator',
			main_language: 'Krio',
			birth_date: {
				_seconds: 1654380000,
				_nanoseconds: 0,
			},
			speaks_english: true,
			om_uid: 424242,
			calling_name: 'Test',
			first_name: 'Dummy',
			progr_status: 'waitlisted',
			recommended_by: 'social_income',
			im_link: 'https://google.com',
			communication_mobile_phone: {
				equals_mobile_money: false,
				has_whatsapp: true,
				phone: 23271118887,
			},
			last_name: 'Sarveshy',
			test_recipient: true,
			gender: 'female',
			num_payment_months: 36,
		},
	};

	for (const [documentId, recipient] of Object.entries(recipients)) {
		await setDoc(doc(firestore, 'recipients', documentId), recipient);
	}
};
