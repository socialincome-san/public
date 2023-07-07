import { getOrInitializeFirebaseAdmin } from '../../shared/src/firebase/admin/app';
import { AuthAdmin } from '../../shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '../../shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '../../shared/src/firebase/admin/StorageAdmin';
import {
	ADMIN_USER_FIRESTORE_PATH,
	AdminUser,
	EXCHANGE_RATES_PATH,
	ExchangeRatesEntry,
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

	// exchange rate entry for April 15, 2023
	await firestoreAdmin.doc<ExchangeRatesEntry>(EXCHANGE_RATES_PATH, '1681516800').set({
		rates: {
			FJD: 2.475631,
			MXN: 20.172035,
			STD: 23181.664088,
			LVL: 0.677475,
			SCR: 14.900475,
			CDF: 2294.317003,
			BBD: 2.251995,
			GTQ: 8.697131,
			CLP: 886.556648,
			HNL: 27.428792,
			UGX: 4160.462087,
			ZAR: 20.180392,
			TND: 3.402591,
			SLE: 24.730935,
			CUC: 1.119996,
			BSD: 1.115407,
			SLL: 22119.929157,
			SDG: 671.998217,
			IQD: 1461.356004,
			CUP: 29.679904,
			GMD: 69.668091,
			TWD: 34.181062,
			RSD: 118.350774,
			DOP: 61.181486,
			KMF: 499.014823,
			MYR: 4.930268,
			FKP: 0.902066,
			XOF: 661.639546,
			GEL: 2.811629,
			BTC: 0.000036886296,
			UYU: 43.127602,
			MAD: 11.32382,
			CVE: 111.207891,
			TOP: 2.625888,
			AZN: 1.90844,
			OMR: 0.431132,
			PGK: 3.980932,
			KES: 148.344428,
			SEK: 11.570911,
			BTN: 91.667744,
			UAH: 41.194828,
			GNF: 9586.713245,
			ERN: 16.799946,
			MZN: 70.840195,
			SVC: 9.759183,
			ARS: 238.671337,
			QAR: 4.07795,
			IRR: 47319.848033,
			MRO: 399.83852,
			CNY: 7.69606,
			THB: 38.329679,
			UZS: 12761.776191,
			XPF: 122.079979,
			BDT: 118.69168,
			LYD: 5.304211,
			BMD: 1.119996,
			KWD: 0.342887,
			PHP: 61.990724,
			RUB: 91.336124,
			PYG: 7966.906673,
			ISK: 152.487941,
			JMD: 169.918315,
			COP: 4918.926933,
			MKD: 62.149739,
			USD: 1.119996,
			DZD: 149.991466,
			PAB: 1.115407,
			GGP: 0.902066,
			SGD: 1.490048,
			ETB: 60.749201,
			JEP: 0.902066,
			KGS: 98.022515,
			SOS: 636.722054,
			VEF: 2744998.494463,
			VUV: 131.979985,
			LAK: 19184.521056,
			BND: 1.478603,
			ZMK: 10081.315559,
			XAF: 661.639546,
			LRD: 182.50384,
			XAG: 0.044115,
			CHF: 1,
			HRK: 7.634044,
			ALL: 113.870587,
			DJF: 198.592724,
			VES: 27.452495,
			ZMW: 20.327261,
			TZS: 2615.493402,
			VND: 26261.115444,
			XAU: 0.000559,
			AUD: 1.669394,
			ILS: 4.112183,
			GHS: 13.216653,
			GYD: 235.900722,
			KPW: 1007.974875,
			BOB: 7.706689,
			KHR: 4531.625735,
			MDL: 19.97627,
			IDR: 16556.402691,
			KYD: 0.929523,
			AMD: 437.932761,
			BWP: 14.580276,
			SHP: 1.362756,
			TRY: 21.682463,
			LBP: 16742.405456,
			TJS: 12.179715,
			JOD: 0.794418,
			AED: 4.112967,
			HKD: 8.791916,
			RWF: 1234.219989,
			EUR: 1.008673,
			LSL: 20.328362,
			DKK: 7.589324,
			CAD: 1.513568,
			BGN: 1.992098,
			MMK: 2342.26451,
			MUR: 50.344262,
			NOK: 11.539956,
			SYP: 2814.018709,
			IMP: 0.902066,
			ZWL: 360.638382,
			GIP: 0.902066,
			RON: 5.03338,
			LKR: 360.280888,
			NGN: 520.242499,
			CRC: 598.198803,
			CZK: 23.75748,
			PKR: 313.281484,
			XCD: 3.026847,
			ANG: 2.010134,
			HTG: 173.438318,
			BHD: 0.420484,
			KZT: 503.350354,
			SRD: 41.042832,
			SZL: 20.147731,
			LTL: 3.307059,
			SAR: 4.201018,
			TTD: 7.573554,
			YER: 280.307139,
			MVR: 17.192368,
			AFN: 96.270571,
			INR: 91.666669,
			AWG: 2.018793,
			KRW: 1460.890126,
			NPR: 146.667344,
			JPY: 149.872362,
			MNT: 3934.731705,
			AOA: 569.522625,
			PLN: 4.727977,
			GBP: 0.901551,
			SBD: 9.296016,
			BYN: 2.815801,
			HUF: 380.546819,
			BYR: 21951.929319,
			BIF: 2321.890853,
			MWK: 1144.757447,
			MGA: 4873.540074,
			XDR: 0.825133,
			BZD: 2.248263,
			BAM: 1.972614,
			EGP: 34.285233,
			MOP: 9.01847,
			NAD: 20.328357,
			NIO: 40.797743,
			PEN: 4.213413,
			NZD: 1.802376,
			WST: 3.043836,
			TMT: 3.919987,
			CLF: 0.032368,
			BRL: 5.499075,
		},
		base: 'CHF',
		timestamp: 1681516800,
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
