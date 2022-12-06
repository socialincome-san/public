import { Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { createWriteStream, unlinkSync } from 'fs';
import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { uploadAndGetDownloadURL, useStorage } from '../../../shared/src/firebase/storageAdmin';
import { Contribution, DonationCertificate, Entity, User } from '../../../shared/src/types';
import { createDonationCertificateCH } from './pdfGeneration';

export const addDocumentToUser = (userId: string, donationCertificate: DonationCertificate) => {
	const downloadUrlMarkDown = `[File Download](${donationCertificate.url})`; // TODO: user regular url
	const documentKey = `${donationCertificate.year}-${donationCertificate.country}`;
	const firestore = useFirestore();
	firestore
		.collection(`users/${userId}/donation-certificate`)
		.doc(documentKey)
		.set(
			{
				url: downloadUrlMarkDown,
				country: donationCertificate.country,
				year: donationCertificate.year.toString(),
			},
			{ merge: true }
		)
		.then(() => {
			console.log('Document successfully written!');
		})
		.catch((error) => {
			console.error('Error writing document: ', error);
		});
};

interface BulkDonationCertificateBuilderFunctionProps {
	users: Entity<User>[];
	year: string;
}

export const createDonationCertificatesFunction = functions.https.onCall(
	async ({ users, year }: BulkDonationCertificateBuilderFunctionProps) => {
		const currentDateString = new Date().toLocaleDateString('de-DE');
		let numberOfPdfCreationSuccessful = 0;
		for (const user of users) {
			try {
				const tempFileName = 'tempPdfFile.pdf';
				const financials = await calculateFinancials(user.id, year);
				const outputFile = createWriteStream(tempFileName);
				await createDonationCertificateCH(user.values, financials, year, currentDateString, outputFile);
				const path = `donation-certificates/${user.id}/${year}_${user.values.location}_${currentDateString}.pdf`;
				const { downloadUrl } = await uploadAndGetDownloadURL(useStorage().bucket(), tempFileName, path);
				addDocumentToUser(user.id, { url: downloadUrl, country: user.values.location || '', year: year });
				numberOfPdfCreationSuccessful += 1;
				unlinkSync(tempFileName);
			} catch (e) {
				console.error(e);
			}
		}
		return `Donation Certificates for ${numberOfPdfCreationSuccessful} of ${users.length} users executed for the year ${year}`;
	}
);

export const calculateFinancials = async (userId: string, year: string) => {
	let contributions: Contribution[] = [];
	const firestore = useFirestore();
	await firestore
		.collection(`users/${userId}/contributions`)
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((element) => {
				contributions.push(element.data() as Contribution);
			});
		})
		.catch((error) => {
			console.log('Error getting documents: ', error);
		});

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
