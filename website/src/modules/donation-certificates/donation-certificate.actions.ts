'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import type { ContributorDonationCertificate } from '@/modules/contributors/contributor.types';
import { revalidatePath } from 'next/cache';
import {
	donationCertificateBatchCreateSchema,
	donationCertificateCreateSchema,
	donationCertificateTableQuerySchema,
} from './donation-certificate.schemas';
import {
	createDonationCertificateForContributor,
	createDonationCertificatesForUser,
	getDonationCertificateContributorOptions,
	getPaginatedDonationCertificates,
} from './donation-certificate.service';
import type { DonationCertificatePaginatedTableView } from './donation-certificate.types';

export const getDonationCertificateTableViewAction = async (
	query: unknown,
): Promise<Result<DonationCertificatePaginatedTableView>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const queryResult = donationCertificateTableQuerySchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail('Invalid table query.');
	}

	return getPaginatedDonationCertificates(sessionResult.data.id, queryResult.data);
};

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
