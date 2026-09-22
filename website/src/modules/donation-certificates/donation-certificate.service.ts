import { ProgramPermission } from '@/generated/prisma/enums';
import {
	isFirebaseStorageConfigured,
	uploadFileToFirebaseStorage,
} from '@/integrations/firebase/firebase-storage.integration';
import { Translator } from '@/lib/i18n/translator';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { DEFAULT_DONATION_CERTIFICATE_LANGUAGE, LANGUAGE_CODES, type LanguageCode } from '@/lib/types/language';
import { now } from '@/lib/utils/now';
import { getSucceededForContributorAndYear } from '@/modules/contributions/contribution.service';
import type { ContributionDonationEntry } from '@/modules/contributions/contribution.types';
import { getContributorsByIds } from '@/modules/contributors/contributor.service';
import type { ContributorDonationCertificate } from '@/modules/contributors/contributor.types';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { createWriteStream } from 'node:fs';
import * as path from 'node:path';
import PDFDocument from 'pdfkit';
import { withFile } from 'tmp-promise';
import * as donationCertificateRepository from './donation-certificate.repository';
import type {
	DonationCertificateError,
	DonationCertificatePaginatedTableView,
	DonationCertificateTableQuery,
	DonationCertificateTableViewRow,
	YourDonationCertificatePaginatedTableView,
	YourDonationCertificateTableQuery,
	YourDonationCertificateTableViewRow,
} from './donation-certificate.types';

export const getPaginatedDonationCertificates = async (
	userId: string,
	query: DonationCertificateTableQuery,
): Promise<ServiceResult<DonationCertificatePaginatedTableView>> => {
	try {
		const accessibleProgramsResult = await getAccessiblePrograms(userId);
		if (!accessibleProgramsResult.success) {
			return resultFail(accessibleProgramsResult.error);
		}

		const accessibleProgramIds = Array.from(
			new Set(
				accessibleProgramsResult.data
					.filter(({ permission }) => permission === ProgramPermission.operator)
					.map(({ programId }) => programId),
			),
		);
		if (accessibleProgramIds.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0 });
		}

		const { certificates, totalCount } = await donationCertificateRepository.findPaginatedDonationCertificates(
			accessibleProgramIds,
			query,
		);
		const tableRows: DonationCertificateTableViewRow[] = certificates.map((certificate) => ({
			id: certificate.id,
			year: certificate.year,
			contributorFirstName: certificate.contributor.contact?.firstName ?? '',
			contributorLastName: certificate.contributor.contact?.lastName ?? '',
			email: certificate.contributor.contact?.email ?? '',
			storagePath: certificate.storagePath,
			createdAt: certificate.createdAt,
		}));

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch donation certificates', { userId, error });

		return resultFail('Could not fetch donation certificates');
	}
};

export const getPaginatedContributorDonationCertificates = async (
	contributorId: string,
	query: YourDonationCertificateTableQuery,
): Promise<ServiceResult<YourDonationCertificatePaginatedTableView>> => {
	try {
		const { certificates, totalCount } = await donationCertificateRepository.findPaginatedContributorDonationCertificates(
			contributorId,
			query,
		);
		const tableRows: YourDonationCertificateTableViewRow[] = certificates.map((certificate) => ({
			id: certificate.id,
			year: certificate.year,
			language: certificate.language,
			createdAt: certificate.createdAt,
			storagePath: certificate.storagePath,
		}));

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch contributor donation certificates', { contributorId, error });

		return resultFail('Could not fetch donation certificates');
	}
};

export const getDonationCertificateContributorOptions = async (
	userId: string,
): Promise<ServiceResult<ContributorDonationCertificate[]>> => getContributorsByIds({ actorUserId: userId });

export const createDonationCertificatesForUser = async (
	userId: string,
	year: number,
	contributorIds: string[],
	language?: LanguageCode,
): Promise<ServiceResult<string>> => {
	const scopedContributorsResult = await getContributorsByIds({
		actorUserId: userId,
		contributorIds,
	});
	if (!scopedContributorsResult.success) {
		return resultFail(scopedContributorsResult.error);
	}
	if (scopedContributorsResult.data.length !== contributorIds.length) {
		return resultFail('Permission denied');
	}

	return createDonationCertificates(
		year,
		scopedContributorsResult.data.map(({ id }) => id),
		language,
	);
};

export const createDonationCertificateForContributor = async (
	year: number,
	contributorId: string,
	language?: LanguageCode,
): Promise<ServiceResult<void>> => {
	try {
		if (!isFirebaseStorageConfigured()) {
			console.error('Firebase Storage bucket name missing');

			return resultFail(DONATION_CERTIFICATE_BUCKET_MISSING);
		}

		const contributorResult = await getContributorsByIds({ contributorIds: [contributorId] });
		const [contributor] = contributorResult.success ? contributorResult.data : [];
		if (!contributorResult.success || !contributor) {
			console.info('Could not load contributor for donation certificate', { contributorId });

			return resultFail(DONATION_CERTIFICATE_TECHNICAL_ERROR);
		}

		const certificateLanguage =
			LANGUAGE_CODES.find((candidate) => candidate === language) ??
			LANGUAGE_CODES.find((candidate) => candidate === contributor.language) ??
			DEFAULT_DONATION_CERTIFICATE_LANGUAGE;
		const existingCertificate = await donationCertificateRepository.findDonationCertificateByYearAndLanguage(
			year,
			contributorId,
			certificateLanguage,
		);
		if (existingCertificate) {
			console.info('Donation certificate already exists', { contributorId, year, language: certificateLanguage });

			return resultFail(DONATION_CERTIFICATE_ALREADY_EXISTS);
		}

		const contributionsResult = await getSucceededForContributorAndYear(contributorId, year);
		if (!contributionsResult.success) {
			console.info('Could not load contributions for donation certificate', { contributorId, year });

			return resultFail(DONATION_CERTIFICATE_TECHNICAL_ERROR);
		}
		if (contributionsResult.data.length === 0) {
			console.info('Contributor has no contributions for donation certificate', { contributorId, year });

			return resultFail(DONATION_CERTIFICATE_NO_CONTRIBUTIONS);
		}

		const destinationFilePath = `users/${contributor.authId}/donation-certificates/${year}_${certificateLanguage}.pdf`;
		const fileResult = await withFile(async ({ path: temporaryFilePath }) => {
			const writeResult = await writeDonationCertificatePdf(
				temporaryFilePath,
				certificateLanguage,
				contributor,
				contributionsResult.data,
				year,
			);
			if (!writeResult.success) {
				return writeResult;
			}

			return uploadFileToFirebaseStorage(temporaryFilePath, destinationFilePath);
		});
		if (!fileResult.success) {
			return resultFail(DONATION_CERTIFICATE_TECHNICAL_ERROR);
		}

		await donationCertificateRepository.createDonationCertificate({
			year,
			language: certificateLanguage,
			storagePath: destinationFilePath,
			contributorId: contributor.id,
		});
		console.info('Donation certificate document written', { contributorId: contributor.id, year });

		return resultOk(undefined);
	} catch (error) {
		console.error('Error while generating donation certificate file', { contributorId, year, error });

		return resultFail(DONATION_CERTIFICATE_TECHNICAL_ERROR);
	}
};

const createDonationCertificates = async (
	year: number,
	contributorIds: string[],
	language?: LanguageCode,
): Promise<ServiceResult<string>> => {
	try {
		let successCount = 0;
		const creationWithFailures: string[] = [];
		const skippedExists: string[] = [];
		const skippedNoContributions: string[] = [];

		await Promise.all(
			contributorIds.map(async (contributorId) => {
				const result = await createDonationCertificateForContributor(year, contributorId, language);
				if (result.success) {
					successCount++;

					return;
				}

				if (result.error === DONATION_CERTIFICATE_ALREADY_EXISTS) {
					skippedExists.push(contributorId);
				} else if (result.error === DONATION_CERTIFICATE_NO_CONTRIBUTIONS) {
					skippedNoContributions.push(contributorId);
				} else {
					creationWithFailures.push(contributorId);
				}
			}),
		);

		if (successCount === 0) {
			console.error('No donation certificates were created', {
				year,
				skippedExistingContributorIds: skippedExists,
				skippedWithoutContributionsContributorIds: skippedNoContributions,
				failedContributorIds: creationWithFailures,
			});

			return resultFail('Could not create donation certificates');
		}

		const success = `Successfully created ${successCount} donation certificates for ${year}.
					Skipped, because certificate already exists (${skippedExists.length}): ${skippedExists.join(', ')}
					Skipped, because no contributions available for contribot (${skippedNoContributions.length}): ${skippedNoContributions.join(', ')}
					Users with errors (${creationWithFailures.length}): ${creationWithFailures.join(', ')}`;
		console.info(success);

		return resultOk(success);
	} catch (error) {
		console.error('Error while creating donation certificates', { year, error });

		return resultFail('Could not create donation certificates');
	}
};

const writeDonationCertificatePdf = async (
	filePath: string,
	language: LanguageCode,
	contributor: ContributorDonationCertificate,
	contributions: ContributionDonationEntry[],
	year: number,
): Promise<ServiceResult<void>> => {
	try {
		const contributionsByCurrency = groupContributionsByCurrency(contributions, year);
		const translator = await Translator.getInstance({
			language,
			namespaces: ['donation-certificate', 'countries'],
		});
		const header = translator.t('header');
		const location = translator.t('location', { context: { date: now() } });
		const country = contributor.address?.country
			? translator.t(contributor.address.country, { namespace: 'countries' })
			: '';
		const title = translator.t('title', { context: { year } });
		const text1 = translator.t('text-1', {
			context: {
				firstname: contributor.firstName,
				lastname: contributor.lastName,
				year,
			},
		});
		const text2 = translator.t('text-2', {
			context: {
				start: new Date(year, 0, 1),
				end: new Date(year, 11, 31),
			},
		});
		const text3 = translator.t('text-3');
		const text4 = translator.t('text-4');
		const text5 = translator.t('text-5');
		const titleKerrin = translator.t('title-kerrin');
		const footerLeftLine1 = translator.t('footer-left-line-1');
		const footerLeftLine2 = translator.t('footer-left-line-2');
		const footerLeftLine3 = translator.t('footer-left-line-3');
		const footerMiddleLine1 = translator.t('footer-middle-line-1');
		const footerMiddleLine2 = translator.t('footer-middle-line-2');
		const footerMiddleLine3 = translator.t('footer-middle-line-3');
		const footerRightLine1 = translator.t('footer-right-line-1');
		const footerRightLine2 = translator.t('footer-right-line-2');
		const footerRightLine3 = translator.t('footer-right-line-3');

		return new Promise<ServiceResult<void>>((resolve) => {
			const pdfDocument = new PDFDocument({ size: 'A4' });
			const writeStream = createWriteStream(filePath);

			pdfDocument.registerFont('unica77', path.join(ASSET_DIR, 'fonts', '/Unica77LLTT-Regular.ttf'));
			pdfDocument.registerFont('unica77-bold', path.join(ASSET_DIR, 'fonts', 'Unica77LLTT-Bold.ttf'));
			pdfDocument.font('unica77');
			pdfDocument.image(path.join(ASSET_DIR, 'logos_si', 'logo_color@2x.png'), 45, 20, { width: 180 });
			pdfDocument.fontSize(10).text(header, 45, 20, { align: 'right' });
			pdfDocument.moveDown(6);
			pdfDocument.fontSize(12);
			pdfDocument.text(`${contributor.firstName} ${contributor.lastName}`);
			if (contributor.email) {
				pdfDocument.text(contributor.email);
			}
			if (contributor.address?.street) {
				pdfDocument.text(`${contributor.address.street} ${contributor.address.number}`);
			}
			if (contributor.address?.city) {
				pdfDocument.text(`${contributor.address.zip} ${contributor.address.city}`);
			}
			if (contributor.address?.country) {
				pdfDocument.text(country);
			}

			pdfDocument.moveDown(6);
			pdfDocument.text(location);
			pdfDocument.moveDown(1.5);
			pdfDocument.font('unica77-bold');
			pdfDocument.text(title);
			pdfDocument.font('unica77');
			pdfDocument.moveDown(1.25);
			pdfDocument.text(text1);
			pdfDocument.moveDown();

			const currencyContributions = Object.entries(contributionsByCurrency);
			if (currencyContributions.length === 0) {
				pdfDocument.text(translator.t('no-contributions'), { underline: true });
			} else {
				currencyContributions.forEach(([currency, amount]) => {
					pdfDocument.text(
						`– ${translator.t('contribution', {
							context: { currency, amount, locale: 'de-CH' },
						})}`,
					);
				});
			}

			pdfDocument.moveDown();
			pdfDocument.text(text2);
			pdfDocument.moveDown();
			pdfDocument.text(text3);
			pdfDocument.moveDown();
			pdfDocument.text(text4);
			pdfDocument.moveDown(2);
			pdfDocument.text(text5);
			pdfDocument.moveDown(1);
			pdfDocument.image(path.join(ASSET_DIR, 'signatures', 'signature_kerrin.png'), 45, pdfDocument.y, { width: 200 });
			pdfDocument.moveDown(1);
			pdfDocument.text('Kerrin Dieckmann', 45, pdfDocument.y);
			pdfDocument.text(titleKerrin, 45, pdfDocument.y);
			pdfDocument.fontSize(10).text(footerLeftLine1, 45, pdfDocument.page.height - 70, { lineBreak: false });
			pdfDocument.text(footerLeftLine2, 45, pdfDocument.page.height - 55, { lineBreak: false });
			pdfDocument.text(footerLeftLine3, 45, pdfDocument.page.height - 40, { lineBreak: false });
			pdfDocument.text(footerMiddleLine1, 215, pdfDocument.page.height - 70, { lineBreak: false });
			pdfDocument.text(footerMiddleLine2, 215, pdfDocument.page.height - 55, { lineBreak: false });
			pdfDocument.text(footerMiddleLine3, 215, pdfDocument.page.height - 40, { lineBreak: false });
			pdfDocument.text(footerRightLine1, 405, pdfDocument.page.height - 70, { lineBreak: false });
			pdfDocument.text(footerRightLine2, 405, pdfDocument.page.height - 55, { lineBreak: false });
			pdfDocument.text(footerRightLine3, 405, pdfDocument.page.height - 40, { lineBreak: false });

			pdfDocument.pipe(writeStream);
			writeStream.on('finish', () => resolve(resultOk(undefined)));
			writeStream.on('error', (error) => {
				console.error('Failed to write donation certificate PDF', { filePath, error });
				resolve(resultFail('Failed to write donation certificate PDF'));
			});
			pdfDocument.end();
		});
	} catch (error) {
		console.error('Failed to create donation certificate PDF', { filePath, error });

		return resultFail('Failed to create donation certificate PDF');
	}
};

const groupContributionsByCurrency = (contributions: ContributionDonationEntry[], year: number): Record<string, number> =>
	contributions.reduce<Record<string, number>>((totals, contribution) => {
		if (contribution.createdAt.getFullYear() === year) {
			totals[contribution.currency] = (totals[contribution.currency] ?? 0) + contribution.amount;
		}

		return totals;
	}, {});

const ASSET_DIR = path.join(process.cwd(), 'public', 'assets');
const DONATION_CERTIFICATE_TECHNICAL_ERROR: DonationCertificateError = 'technicalError';
const DONATION_CERTIFICATE_BUCKET_MISSING: DonationCertificateError = 'bucketMissing';
const DONATION_CERTIFICATE_ALREADY_EXISTS: DonationCertificateError = 'alreadyExists';
const DONATION_CERTIFICATE_NO_CONTRIBUTIONS: DonationCertificateError = 'noContributions';
