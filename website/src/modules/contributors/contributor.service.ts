import { CountryCode, ProgramPermission } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { nowMs } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { createFirebaseUserByEmail, findFirebaseUserByEmail, updateFirebaseUserByUid } from '@/modules/auth/auth.service';
import { subscribeToNewsletter, toNewsletterLanguage } from '@/modules/newsletter/newsletter.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import {
	canCreateContributor,
	canListContributors,
	canReadContributor,
	canUpdateContributor,
} from './contributor.permissions';
import * as contributorRepository from './contributor.repository';
import {
	contributorCreateSchema,
	contributorUpdateSchema,
	type CreateContributorInput,
	type UpdateContributorInput,
	type UpdateContributorSelfInput,
} from './contributor.schemas';
import type {
	BankContributorData,
	CampaignGuestAccountData,
	ContributorCommunityStats,
	ContributorDonationCertificate,
	ContributorOption,
	ContributorPaginatedTableView,
	ContributorPayload,
	ContributorRecord,
	ContributorSession,
	ContributorTableQuery,
	ContributorTableViewRow,
	ContributorUpdateUniquenessContext,
	ContributorWithContact,
	StripeContributorData,
} from './contributor.types';

export const countContributorsCreatedBetween = async (from: Date, to: Date): Promise<ServiceResult<number>> => {
	try {
		return resultOk(await contributorRepository.countContributorsCreatedBetween(from, to));
	} catch (error) {
		console.error('Could not count newly created contributors', { error });

		return resultFail('Could not count newly created contributors');
	}
};

export const getCommunityStats = async (): Promise<ServiceResult<ContributorCommunityStats>> => {
	try {
		const contributions = await contributorRepository.findCommunityContributionCountries();
		const countries = new Set(
			contributions
				.map((contribution) => contribution.contributor.contact?.address?.country)
				.filter((country): country is CountryCode => Boolean(country)),
		);

		return resultOk({
			supporterCount: contributions.length,
			countryCount: countries.size,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contributor community stats');
	}
};

export const getContributor = async (userId: string, contributorId: string): Promise<ServiceResult<ContributorPayload>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canReadContributor(accessResult.data)) {
			return resultFail('Contributor not found');
		}

		const contributor = await contributorRepository.findContributor(
			contributorId,
			uniqueProgramIds(accessResult.data.map((program) => program.programId)),
		);
		if (!contributor) {
			return resultFail('Contributor not found');
		}

		return resultOk(contributor);
	} catch (error) {
		console.error(error);

		return resultFail('Could not get contributor');
	}
};

export const getEditableContributorOptions = async (userId: string): Promise<ServiceResult<ContributorOption[]>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const accessibleProgramIds = uniqueProgramIds(
			accessResult.data
				.filter((program) => program.permission === ProgramPermission.operator)
				.map((program) => program.programId),
		);
		if (accessibleProgramIds.length === 0) {
			return resultOk([]);
		}

		const contributors = await contributorRepository.findEditableContributorOptions(accessibleProgramIds);

		return resultOk(
			contributors.map((contributor) => ({
				id: contributor.id,
				name: `${contributor.contact?.firstName ?? ''} ${contributor.contact?.lastName ?? ''}`.trim(),
			})),
		);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch editable contributor options');
	}
};

export const getPaginatedContributorTableView = async (
	userId: string,
	query: ContributorTableQuery,
): Promise<ServiceResult<ContributorPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canListContributors(accessResult.data)) {
			return resultOk({
				tableRows: [],
				totalCount: 0,
				countryFilterOptions: [],
			});
		}

		const accessibleProgramIds = uniqueProgramIds(
			accessResult.data
				.filter((program) => program.permission === ProgramPermission.operator)
				.map((program) => program.programId),
		);
		if (accessibleProgramIds.length === 0) {
			return resultOk({
				tableRows: [],
				totalCount: 0,
				countryFilterOptions: [],
			});
		}

		const country = parseCountryCode(query.country);
		const sortBy = toSortKey(query.sortBy, ['id', 'contributor', 'email', 'country', 'totalContributedChf', 'createdAt']);
		const shouldSortByTotal = sortBy === 'totalContributedChf';
		const [{ contributors, totalCount }, countrySource] = await Promise.all([
			contributorRepository.findContributorTableSource({
				accessibleProgramIds,
				query,
				country,
				paginate: !shouldSortByTotal,
			}),
			contributorRepository.findContributorCountryFilterSource(accessibleProgramIds),
		]);

		let pageContributors = contributors;
		if (shouldSortByTotal) {
			const sumsByContributorId = await getContributionSumsByContributorId(
				contributors.map((contributor) => contributor.id),
			);
			const directionMultiplier = query.sortDirection === 'asc' ? 1 : -1;
			const sorted = [...contributors].sort((left, right) => {
				const leftValue = sumsByContributorId.get(left.id) ?? 0;
				const rightValue = sumsByContributorId.get(right.id) ?? 0;
				if (leftValue !== rightValue) {
					return (leftValue - rightValue) * directionMultiplier;
				}

				return left.id.localeCompare(right.id);
			});
			const start = (query.page - 1) * query.pageSize;
			pageContributors = sorted.slice(start, start + query.pageSize);
		}

		const sumsByContributorId = await getContributionSumsByContributorId(
			pageContributors.map((contributor) => contributor.id),
		);
		const tableRows: ContributorTableViewRow[] = pageContributors.map((contributor) => ({
			id: contributor.id,
			firstName: contributor.contact?.firstName ?? '',
			lastName: contributor.contact?.lastName ?? '',
			email: contributor.contact?.email ?? '',
			firebaseAuthUserId: contributor.account.firebaseAuthUserId,
			country: contributor.contact?.address?.country ?? null,
			totalContributedChf: sumsByContributorId.get(contributor.id) ?? 0,
			createdAt: contributor.createdAt,
		}));
		const countryFilterOptions = Array.from(
			new Set(
				countrySource
					.map((contributor) => contributor.contact?.address?.country)
					.filter((value): value is CountryCode => Boolean(value)),
			),
		)
			.sort()
			.map((value) => ({ value, label: value }));

		return resultOk({ tableRows, totalCount, countryFilterOptions });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contributors');
	}
};

export const getContributorsByIds = async (params?: {
	actorUserId?: string;
	contributorIds?: string[];
}): Promise<ServiceResult<ContributorDonationCertificate[]>> => {
	try {
		let accessibleProgramIds: string[] | undefined;
		if (params?.actorUserId) {
			const accessResult = await getAccessiblePrograms(params.actorUserId);
			if (!accessResult.success) {
				return resultFail(accessResult.error);
			}
			accessibleProgramIds = uniqueProgramIds(accessResult.data.map((program) => program.programId));
			if (accessibleProgramIds.length === 0) {
				return resultOk([]);
			}
		}

		const contributors = await contributorRepository.findContributorsForDonationCertificates({
			contributorIds: params?.contributorIds,
			accessibleProgramIds,
		});

		return resultOk(
			contributors.map((contributor) => ({
				id: contributor.id,
				firstName: contributor.contact.firstName,
				lastName: contributor.contact.lastName,
				language: contributor.contact.language,
				email: contributor.contact.email,
				address: contributor.contact.address,
				authId: contributor.account.firebaseAuthUserId,
			})),
		);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contributor IDs for certificates');
	}
};

export const findContributorById = async (contributorId: string): Promise<ServiceResult<{ id: string } | null>> => {
	try {
		return resultOk(await contributorRepository.findContributorId(contributorId));
	} catch (error) {
		console.error(error);

		return resultFail('Could not find contributor');
	}
};

export const findContributorByAccountId = async (
	accountId: string,
): Promise<ServiceResult<ContributorWithContact | null>> => {
	try {
		return resultOk(await contributorRepository.findContributorByAccountId(accountId));
	} catch (error) {
		console.error(error);

		return resultFail('Could not find contributor');
	}
};

export const findContributorByStripeCustomerOrEmail = async (
	stripeCustomerId: string,
	email?: string,
): Promise<ServiceResult<ContributorWithContact | null>> => {
	try {
		const byStripeCustomer = await contributorRepository.findContributorByStripeCustomerId(stripeCustomerId);
		if (byStripeCustomer) {
			return resultOk(byStripeCustomer);
		}
		if (!email) {
			return resultOk(null);
		}

		return resultOk(await contributorRepository.findContributorByEmail(email));
	} catch (error) {
		console.error(error);

		return resultFail('Could not find contributor');
	}
};

export const getCurrentContributorSession = async (
	firebaseAuthUserId: string,
): Promise<ServiceResult<ContributorSession>> => {
	try {
		const contributor = await contributorRepository.findContributorSessionByFirebaseAuthUserId(firebaseAuthUserId);
		if (!contributor) {
			return resultFail('Contributor not found');
		}

		return resultOk({
			type: 'contributor',
			id: contributor.id,
			gender: contributor.contact?.gender ?? null,
			referral: contributor.referral,
			email: contributor.contact?.email ?? null,
			firstName: contributor.contact?.firstName ?? null,
			lastName: contributor.contact?.lastName ?? null,
			stripeCustomerId: contributor.stripeCustomerId ?? null,
			language: contributor.contact?.language ?? null,
			street: contributor.contact?.address?.street ?? null,
			number: contributor.contact?.address?.number ?? null,
			city: contributor.contact?.address?.city ?? null,
			zip: contributor.contact?.address?.zip ?? null,
			country: contributor.contact?.address?.country ?? null,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch contributor session');
	}
};

export const findContributorsByPaymentReferenceIds = async (
	paymentReferenceIds: string[],
): Promise<ServiceResult<ContributorWithContact[]>> => {
	try {
		return resultOk(await contributorRepository.findContributorsByPaymentReferenceIds(paymentReferenceIds));
	} catch (error) {
		console.error(error);

		return resultFail('Could not find contributor by Payment Reference ID');
	}
};

export const updateContributor = async (
	userId: string,
	input: UpdateContributorInput,
): Promise<ServiceResult<ContributorRecord>> => {
	const inputResult = validateContributorUpdateInput(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error);
	}
	const validatedInput = inputResult.data;

	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const existing = await contributorRepository.findContributorForPortalUpdate(validatedInput.id);
		if (!existing) {
			return resultFail('Contributor not found');
		}

		const contributorPrograms = await contributorRepository.findContributorProgramIds(validatedInput.id);
		if (
			!canUpdateContributor(
				accessResult.data,
				contributorPrograms.map((entry) => entry.campaign.programId),
			)
		) {
			return resultFail('No permissions to update contributor');
		}

		const uniquenessResult = await validateUpdateUniqueness(validatedInput, {
			existingContactId: existing.contact.id,
			existingEmail: existing.contact.email,
			existingPhoneId: existing.contact.phone?.id ?? null,
			existingPhoneNumber: existing.contact.phone?.number ?? null,
		});
		if (!uniquenessResult.success) {
			return resultFail(uniquenessResult.error);
		}

		const newDisplayName = `${validatedInput.contact.firstName} ${validatedInput.contact.lastName}`.trim();
		const oldDisplayName = `${existing.contact.firstName} ${existing.contact.lastName}`.trim();
		if (validatedInput.contact.email !== existing.contact.email || newDisplayName !== oldDisplayName) {
			const firebaseResult = await updateFirebaseUserByUid(existing.account.firebaseAuthUserId, {
				email: validatedInput.contact.email,
				displayName: newDisplayName,
			});
			if (!firebaseResult.success) {
				console.warn('Could not update Firebase Auth user', { error: firebaseResult.error });
			}
		}

		const updated = await contributorRepository.updateContributor(validatedInput, {
			contactId: existing.contact.id,
			phoneId: existing.contact.phone?.id,
			phoneNumber: existing.contact.phone?.number,
			addressId: existing.contact.address?.id,
		});

		const previousPhoneId = existing.contact.phone?.id;
		const previousPhoneNumber = existing.contact.phone?.number ?? null;
		const didRemovePhone = !validatedInput.contact.phone;
		const didChangePhoneNumber =
			Boolean(validatedInput.contact.phone) && validatedInput.contact.phone !== previousPhoneNumber;
		if ((didRemovePhone || didChangePhoneNumber) && previousPhoneId) {
			await contributorRepository.deletePhoneIfOrphaned(previousPhoneId);
		}

		const previousAddressId = existing.contact.address?.id;
		if (previousAddressId && !hasAddressInput(validatedInput.contact)) {
			await contributorRepository.deleteAddressIfOrphaned(previousAddressId);
		}

		return resultOk(updated);
	} catch (error) {
		console.error(error);

		return resultFail('Could not update contributor. Please try again later.');
	}
};

export const updateContributorSelf = async (
	contributorId: string,
	input: UpdateContributorSelfInput,
): Promise<ServiceResult<ContributorRecord>> => {
	try {
		const existing = await contributorRepository.findContributorForSelfUpdate(contributorId);
		if (!existing?.contact) {
			return resultFail('Contributor not found');
		}

		const newEmail = input.contact.email;
		const oldEmail = existing.contact.email ?? null;
		if (newEmail !== oldEmail) {
			const firebaseResult = await updateFirebaseUserByUid(existing.account.firebaseAuthUserId, {
				email: newEmail,
			});
			if (!firebaseResult.success) {
				console.warn('Could not update Firebase Auth user', { error: firebaseResult.error });
			}
		}

		const updatedContributor = await contributorRepository.updateContributorSelf(
			contributorId,
			input,
			existing.contact.id,
			existing.contact.address?.id,
		);

		return resultOk(updatedContributor);
	} catch (error) {
		console.error(error);

		return resultFail('Could not update contributor');
	}
};

export const getOrCreateContributorWithFirebaseAuth = async (
	contributorData: StripeContributorData,
): Promise<ServiceResult<{ contributor: ContributorWithContact; isNewContributor: boolean }>> => {
	try {
		const existingResult = await findContributorByStripeCustomerOrEmail(
			contributorData.stripeCustomerId,
			contributorData.email || undefined,
		);
		if (!existingResult.success) {
			return resultFail(existingResult.error);
		}

		if (existingResult.data) {
			if (!existingResult.data.stripeCustomerId) {
				const updated = await contributorRepository.updateContributorStripeCustomerId(
					existingResult.data.id,
					contributorData.stripeCustomerId,
				);

				return resultOk({ contributor: updated, isNewContributor: false });
			}

			return resultOk({ contributor: existingResult.data, isNewContributor: false });
		}

		const firebaseResult = await getOrCreateFirebaseUser({
			email: contributorData.email,
			displayName: `${contributorData.firstName} ${contributorData.lastName}`,
		});
		if (!firebaseResult.success) {
			console.error('Could not create Firebase user for Stripe contributor', { error: firebaseResult.error });

			return resultFail('Could not create contributor authentication user');
		}

		const contributor = await contributorRepository.createContributorFromStripeData(
			contributorData,
			firebaseResult.data.uid,
		);

		return resultOk({ contributor, isNewContributor: true });
	} catch (error) {
		console.error(error);

		return resultFail('Could not get or create contributor from Stripe customer');
	}
};

export const getOrCreateContributorForAccount = async (
	accountId: string,
	stripeCustomerId: string,
	contactId: string,
): Promise<ServiceResult<{ contributor: ContributorWithContact; isNewContributor: boolean }>> => {
	try {
		const existing = await contributorRepository.findContributorByAccountId(accountId);
		if (existing) {
			if (!existing.stripeCustomerId) {
				const updated = await contributorRepository.updateContributorStripeCustomerId(existing.id, stripeCustomerId);

				return resultOk({ contributor: updated, isNewContributor: false });
			}

			return resultOk({ contributor: existing, isNewContributor: false });
		}

		const contributor = await contributorRepository.createContributorForAccount(accountId, stripeCustomerId, contactId);

		return resultOk({ contributor, isNewContributor: true });
	} catch (error) {
		console.error(error);

		return resultFail('Could not get or create contributor for account');
	}
};

export const getOrCreateReferenceIdByEmail = async (email: string): Promise<ServiceResult<string>> => {
	try {
		const existingContributor = await contributorRepository.findContributorPaymentReferenceByEmail(email);
		const referenceId =
			existingContributor?.paymentReferenceId && existingContributor.paymentReferenceId.length > 0
				? existingContributor.paymentReferenceId
				: nowMs().toString();
		if (existingContributor && !existingContributor.paymentReferenceId) {
			const updated = await contributorRepository.updateContributorPaymentReferenceId(existingContributor.id, referenceId);
			if (!updated) {
				return resultFail('Could not update existing contributor with newly created reference ID');
			}
		}

		return resultOk(referenceId);
	} catch (error) {
		console.error(error);

		return resultFail('Could not get or generate contributor reference ID');
	}
};

export const getOrCreateContributorByReferenceId = async (
	contributorData: BankContributorData,
): Promise<ServiceResult<ContributorRecord>> => {
	try {
		const existingContributor = await contributorRepository.findContributorByPaymentReferenceId(
			contributorData.paymentReferenceId,
		);
		if (existingContributor) {
			return resultOk(existingContributor);
		}

		const existingByEmail = await contributorRepository.findContributorIdByEmail(contributorData.email);
		if (existingByEmail) {
			if (existingByEmail.paymentReferenceId !== contributorData.paymentReferenceId) {
				const updated = await updateContributorSelf(existingByEmail.id, {
					paymentReferenceId: contributorData.paymentReferenceId,
					contact: {
						email: contributorData.email,
					},
				});
				if (!updated.success) {
					return resultFail(updated.error);
				}

				return resultOk(updated.data);
			}

			const contributor = await contributorRepository.findContributorRecord(existingByEmail.id);
			if (!contributor) {
				return resultFail('Contributor not found after lookup by email');
			}

			return resultOk(contributor);
		}

		const firebaseResult = await getOrCreateFirebaseUser({
			email: contributorData.email,
			displayName: `${contributorData.firstName} ${contributorData.lastName}`,
		});
		if (!firebaseResult.success) {
			console.error('Could not create Firebase user for bank contributor', { error: firebaseResult.error });

			return resultFail('Could not create contributor authentication user');
		}

		const newContributor = await contributorRepository.createContributorFromBankData(
			contributorData,
			firebaseResult.data.uid,
		);
		await subscribeToNewsletter({
			firstname: contributorData.firstName,
			lastname: contributorData.lastName,
			email: contributorData.email,
			language: toNewsletterLanguage(contributorData.language),
		});

		return resultOk(newContributor);
	} catch (error) {
		console.error(error);

		return resultFail('Could not get or create contributor by reference ID');
	}
};

export const getOrCreateContributorFromEmailAndName = async (
	accountData: CampaignGuestAccountData,
): Promise<ServiceResult<{ contributor: ContributorWithContact; isNewContributor: boolean }>> => {
	try {
		const existing = await contributorRepository.findContributorByEmail(accountData.email);
		if (existing) {
			return resultOk({ contributor: existing, isNewContributor: false });
		}

		const firebaseResult = await getOrCreateFirebaseUser({
			email: accountData.email,
			displayName: `${accountData.firstName} ${accountData.lastName}`,
		});
		if (!firebaseResult.success) {
			console.error('Could not create Firebase user for campaign contributor', { error: firebaseResult.error });

			return resultFail('Could not create contributor authentication user');
		}

		try {
			const contributor = await contributorRepository.createContributorFromEmailAndName(
				accountData,
				firebaseResult.data.uid,
			);

			return resultOk({ contributor, isNewContributor: true });
		} catch (createError) {
			if (isExpectedContributorCreateUniqueConstraint(createError)) {
				const concurrent = await contributorRepository.findContributorByEmailOrFirebaseAuthUserId(
					accountData.email,
					firebaseResult.data.uid,
				);
				if (concurrent) {
					return resultOk({ contributor: concurrent, isNewContributor: false });
				}
			}

			console.error(createError);

			return resultFail('Could not get or create contributor from email');
		}
	} catch (error) {
		console.error(error);

		return resultFail('Could not get or create contributor from email');
	}
};

export const createContributor = async (
	userId: string,
	input: CreateContributorInput,
): Promise<ServiceResult<ContributorRecord>> => {
	const inputResult = validateContributorCreateInput(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error);
	}
	const validatedInput = inputResult.data;

	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canCreateContributor(accessResult.data)) {
			return resultFail('No permission to create contributor');
		}

		const uniquenessResult = await validateCreateUniqueness(validatedInput);
		if (!uniquenessResult.success) {
			return resultFail(uniquenessResult.error);
		}

		const displayName = `${validatedInput.contact.firstName} ${validatedInput.contact.lastName}`.trim();
		const firebaseResult = await getOrCreateFirebaseUser({
			email: validatedInput.contact.email,
			displayName,
		});
		if (!firebaseResult.success) {
			console.error('Could not create Firebase user for contributor', { error: firebaseResult.error });

			return resultFail('Could not create contributor authentication user');
		}

		const contributor = await contributorRepository.createContributor(validatedInput, firebaseResult.data.uid);

		return resultOk(contributor);
	} catch (error) {
		console.error(error);

		return resultFail('Could not create contributor. Please try again later.');
	}
};

const validateContributorCreateInput = (input: CreateContributorInput): ServiceResult<CreateContributorInput> => {
	const parsedInput = contributorCreateSchema.safeParse(input);

	return parsedInput.success ? resultOk(parsedInput.data) : resultFail('Invalid input.');
};

const validateContributorUpdateInput = (input: UpdateContributorInput): ServiceResult<UpdateContributorInput> => {
	const parsedInput = contributorUpdateSchema.safeParse(input);

	return parsedInput.success ? resultOk(parsedInput.data) : resultFail('Invalid input.');
};

const validateCreateUniqueness = async (input: CreateContributorInput): Promise<ServiceResult<void>> => {
	const emailConflict = await contributorRepository.findContactByEmail(input.contact.email);
	if (emailConflict) {
		return resultFail('A contact with this email already exists.');
	}

	if (input.contact.phone) {
		const phoneConflict = await contributorRepository.findPhoneByNumber(input.contact.phone);
		if (phoneConflict) {
			return resultFail('A contact with this phone number already exists.');
		}
	}

	return resultOk(undefined);
};

const validateUpdateUniqueness = async (
	input: UpdateContributorInput,
	context: ContributorUpdateUniquenessContext,
): Promise<ServiceResult<void>> => {
	if (input.contact.email !== context.existingEmail) {
		const emailConflict = await contributorRepository.findContactByEmail(input.contact.email);
		if (emailConflict && emailConflict.id !== context.existingContactId) {
			return resultFail('A contact with this email already exists.');
		}
	}

	const newPhone = input.contact.phone ?? null;
	if (newPhone && newPhone !== context.existingPhoneNumber) {
		const phoneConflict = await contributorRepository.findPhoneByNumber(newPhone);
		if (phoneConflict && phoneConflict.id !== context.existingPhoneId) {
			return resultFail('A contact with this phone number already exists.');
		}
	}

	return resultOk(undefined);
};

const getOrCreateFirebaseUser = async (input: {
	email: string;
	displayName: string;
}): Promise<ServiceResult<{ uid: string }>> => {
	const existing = await findFirebaseUserByEmail(input.email);
	if (!existing.success) {
		return resultFail(existing.error);
	}
	if (existing.data) {
		return resultOk({ uid: existing.data.uid });
	}

	const created = await createFirebaseUserByEmail(input);
	if (!created.success) {
		return resultFail(created.error);
	}

	return resultOk({ uid: created.data.uid });
};

const getContributionSumsByContributorId = async (contributorIds: string[]): Promise<Map<string, number>> => {
	const grouped = await contributorRepository.groupContributionSumsByContributorId(contributorIds);

	return new Map(grouped.map((row) => [row.contributorId, Number(row._sum.amountChf ?? 0)]));
};

const uniqueProgramIds = (programIds: string[]): string[] => Array.from(new Set(programIds));

const parseCountryCode = (value: string | undefined): CountryCode | undefined => {
	const normalizedValue = value?.trim();
	if (!normalizedValue) {
		return undefined;
	}

	return Object.values(CountryCode).find((country) => country === normalizedValue);
};

const hasAddressInput = (contact: CreateContributorInput['contact']): boolean =>
	[contact.street, contact.number, contact.city, contact.zip, contact.country].some(Boolean);

const isExpectedContributorCreateUniqueConstraint = (error: unknown): boolean => {
	if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'P2002') {
		return false;
	}
	if (!('meta' in error) || typeof error.meta !== 'object' || error.meta === null || !('target' in error.meta)) {
		return false;
	}

	const target = error.meta.target;
	const fields = Array.isArray(target)
		? target.filter((field): field is string => typeof field === 'string')
		: typeof target === 'string'
			? [target]
			: [];

	return fields.some((field) => field === 'email' || field === 'firebaseAuthUserId' || field === 'firebase_auth_user_id');
};
