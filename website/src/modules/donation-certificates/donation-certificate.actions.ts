'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail, type Result } from '@/lib/result';
import type { ContributorDonationCertificate } from '@/modules/contributors/contributor.types';
import { revalidatePath } from 'next/cache';
import { donationCertificateBatchCreateSchema, donationCertificateCreateSchema } from './donation-certificate.schemas';
import {
	createDonationCertificateForContributor,
	createDonationCertificatesForUser,
	getDonationCertificateContributorOptions,
} from './donation-certificate.service';

export const getDonationCertificateContributorOptionsAction = async (): Promise<
	Result<ContributorDonationCertificate[]>
> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getDonationCertificateContributorOptions(sessionResult.data.id);
};

export const createDonationCertificatesAction = async (input: unknown): Promise<Result<string>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedInput = donationCertificateBatchCreateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid donation certificate input.');
	}

	const result = await createDonationCertificatesForUser(
		sessionResult.data.id,
		parsedInput.data.year,
		parsedInput.data.contributorIds,
		parsedInput.data.language,
	);
	revalidatePath('/portal/management/donation-certificates');

	return result;
};

export const createCurrentContributorDonationCertificateAction = async (input: unknown): Promise<Result<void>> => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedInput = donationCertificateCreateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid donation certificate input.');
	}

	const result = await createDonationCertificateForContributor(
		parsedInput.data.year,
		sessionResult.data.id,
		parsedInput.data.language,
	);
	revalidatePath('/dashboard/donation-certificates');

	return result;
};
