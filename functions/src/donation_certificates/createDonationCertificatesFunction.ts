import { Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { Contribution, Entity, User } from '../../../shared/src/types';
import { createDonationCertificateCH, translationStubFrench, translationStubGerman } from './pdfGeneration';

interface BulkDonationCertificateBuilderFuncionProps {
	users: Entity<User>[];
	year: string;
}

export const createDonationCertificatesFunction = functions.https.onCall(
	async ({ users, year }: BulkDonationCertificateBuilderFuncionProps) => {
		let numberOfPdfCreationSuccessful = 0;
		for (const user of users) {
			try {
				const userData = await prepareUserData(user, year);
				let translations;
				if (userData.location === 'CH') {
					translations = await translationStubGerman();
				} else {
					translations = await translationStubFrench();
				}
				createDonationCertificateCH(userData, translations);
				numberOfPdfCreationSuccessful += 1;
			} catch (e) {
				console.error(e);
			}
		}
		return `Donation Certificates for ${numberOfPdfCreationSuccessful} of ${users.length} users executed for the year ${year}`;
	}
);

export const prepareUserData = async (data: Entity<User>, calculationYear: string) => {
	const currentDate = new Date().toLocaleDateString('de-DE');
	let contributions: Contribution[] = [];
	const firestore = useFirestore();
	await firestore
		.collection('users/' + data.id + '/contributions')
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((element) => {
				contributions.push(element.data() as Contribution);
			});
		})
		.catch((error) => {
			console.log('Error getting documents: ', error);
		});

	return {
		entityId: data.id,
		year: calculationYear,
		location: data.values.location,
		currentDate: currentDate,
		address: data.values.address,
		personal: data.values.personal,
		financials: await calculateFinancials(contributions, calculationYear),
	};
};

export const calculateFinancials = async (contributions: Contribution[], year: string) => {
	let total_chf = 0;
	let total_usd = 0;
	let total_eur = 0;
	let lineItems: any[] = [];

	// TODO: use lodash to calculate financialData
	// const totalContributionsByCurrency = _(contributions)
	// 	.filter((contribution) => contribution.created?.toDate()?.getFullYear() === year)
	// 	.groupBy((contribution) => contribution.currency)
	// 	.mapValues((contributions) => _.sumBy(contributions, (contribution) => contribution.amount));

	for await (const contribution of contributions) {
		const timestamp = contribution.created as Timestamp;
		const date = new Date(timestamp.seconds * 1000);
		const contributionYear = date.getFullYear().toString();

		if (year === contributionYear.toString()) {
			switch (contribution.currency) {
				case 'chf':
					total_chf += contribution.amount;
					break;
				case 'usd':
					total_usd += contribution.amount;
					break;
				case 'eur':
					total_eur += contribution.amount;
					break;
			}
			const dateString = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
			const lineItem = dateString + ';' + contribution.amount + ';' + contribution.currency;
			lineItems.push(lineItem.toString());
		}
	}

	const financialData = {
		total_chf: total_chf,
		total_eur: total_eur,
		total_usd: total_usd,
		lineItems: lineItems,
	};
	console.log(financialData);
	return financialData;
};
