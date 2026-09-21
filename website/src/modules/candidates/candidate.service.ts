import { CountryCode, Gender, type Profile } from '@/generated/prisma/enums';
import {
	createFirebaseUserByPhoneNumber,
	deleteFirebaseUserByPhoneNumberIfExists,
	updateFirebaseUserByPhoneNumber,
} from '@/integrations/firebase/firebase-auth.integration';
import type { Session } from '@/lib/firebase/current-account';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { parseCsvOptionalFields, parseCsvText, stringifyCsv } from '@/lib/utils/csv';
import { getCountryIsoCode } from '@/modules/countries/country.service';
import { isAdmin } from '@/modules/users/user.service';
import * as candidateRepository from './candidate.repository';
import { candidateCreateSchema, type CandidateCreateInput, type CandidateUpdateInput } from './candidate.schemas';
import type {
	CandidatePayload,
	CandidatesPaginatedTableView,
	CandidatesTableQuery,
	CandidatesTableViewRow,
} from './candidate.types';

export const getCandidate = async (session: Session, candidateId: string): Promise<ServiceResult<CandidatePayload>> => {
	if (session.type === 'contributor') {
		return resultFail('Permission denied');
	}

	try {
		const candidate = await candidateRepository.findCandidateById(candidateId);
		if (!candidate) {
			return resultFail('Candidate not found');
		}
		if (candidate.programId !== null) {
			return resultFail('Not a candidate');
		}
		const accessResult = await validateCandidateAccess(session, candidate.localPartnerId);
		if (!accessResult.success) {
			return accessResult;
		}

		return resultOk(candidate);
	} catch (error) {
		console.error('Could not fetch candidate', { candidateId, error });

		return resultFail('Could not fetch candidate');
	}
};

export const getPaginatedCandidateTableView = async (
	userId: string,
	query: CandidatesTableQuery,
): Promise<ServiceResult<CandidatesPaginatedTableView>> => {
	const adminResult = await isAdmin(userId);
	if (!adminResult.success) {
		return resultFail(adminResult.error);
	}

	return getPaginatedCandidates(query);
};

export const getPaginatedCandidateTableViewByLocalPartner = async (
	localPartnerId: string,
	query: CandidatesTableQuery,
): Promise<ServiceResult<CandidatesPaginatedTableView>> => getPaginatedCandidates(query, localPartnerId);

export const getCandidateCount = async (
	focuses?: string[],
	profiles?: Profile[],
	countryId?: string | null,
): Promise<ServiceResult<{ count: number }>> => {
	try {
		let countryCode: CountryCode | null = null;
		if (countryId) {
			const countryResult = await getCountryIsoCode(countryId);
			if (!countryResult.success) {
				return resultFail(countryResult.error);
			}
			countryCode = countryResult.data;
		}

		return resultOk({
			count: await candidateRepository.countCandidates(focuses, profiles, countryCode),
		});
	} catch (error) {
		console.error('Could not count candidates', { error });

		return resultFail('Could not count candidates');
	}
};

export const exportCandidatesCsv = async (session: Session): Promise<ServiceResult<string>> => {
	if (session.type === 'contributor') {
		return resultFail('Permission denied');
	}
	if (session.type === 'user') {
		const adminResult = await isAdmin(session.id);
		if (!adminResult.success) {
			return resultFail(adminResult.error);
		}
	}

	try {
		const candidates = await candidateRepository.findCandidatesForCsvExport(
			session.type === 'local-partner' ? session.id : undefined,
		);
		const formatDate = (value: Date | null | undefined) => (value ? value.toISOString() : '');
		const rows = candidates.map((candidate) => ({
			id: candidate.id,
			createdAt: formatDate(candidate.createdAt),
			updatedAt: formatDate(candidate.updatedAt),
			localPartnerId: candidate.localPartner?.id ?? '',
			localPartnerName: candidate.localPartner?.name ?? '',
			suspendedAt: formatDate(candidate.suspendedAt),
			suspensionReason: candidate.suspensionReason ?? '',
			successorName: candidate.successorName ?? '',
			termsAccepted: candidate.termsAccepted ? 'true' : 'false',
			countryResolved: candidate.contact?.address?.country ?? candidate.localPartner?.contact?.address?.country ?? '',
			contactId: candidate.contact?.id ?? '',
			contactFirstName: candidate.contact?.firstName ?? '',
			contactLastName: candidate.contact?.lastName ?? '',
			contactCallingName: candidate.contact?.callingName ?? '',
			contactEmail: candidate.contact?.email ?? '',
			contactGender: candidate.contact?.gender ?? '',
			contactLanguage: candidate.contact?.language ?? '',
			contactDateOfBirth: formatDate(candidate.contact?.dateOfBirth),
			contactProfession: candidate.contact?.profession ?? '',
			contactPhone: candidate.contact?.phone?.number ?? '',
			contactAddressStreet: candidate.contact?.address?.street ?? '',
			contactAddressNumber: candidate.contact?.address?.number ?? '',
			contactAddressZip: candidate.contact?.address?.zip ?? '',
			contactAddressCity: candidate.contact?.address?.city ?? '',
			contactAddressCountry: candidate.contact?.address?.country ?? '',
			paymentInformationId: candidate.paymentInformation?.id ?? '',
			paymentMobileMoneyProviderId: candidate.paymentInformation?.mobileMoneyProvider?.id ?? '',
			paymentMobileMoneyProviderName: candidate.paymentInformation?.mobileMoneyProvider?.name ?? '',
			paymentCode: candidate.paymentInformation?.code ?? '',
			paymentPhone: candidate.paymentInformation?.phone?.number ?? '',
		}));

		return resultOk(stringifyCsv(rows, CANDIDATE_CSV_HEADERS));
	} catch (error) {
		console.error('Could not export candidates CSV', { error });

		return resultFail('Could not export candidates CSV');
	}
};

export const createCandidate = async (
	session: Session,
	input: CandidateCreateInput,
): Promise<ServiceResult<CandidatePayload>> => {
	if (session.type === 'contributor') {
		return resultFail('Permission denied');
	}
	if (session.type === 'user') {
		const adminResult = await isAdmin(session.id);
		if (!adminResult.success) {
			return resultFail(adminResult.error);
		}
	}

	const localPartnerId = session.type === 'local-partner' ? session.id : input.localPartnerId;
	if (!localPartnerId) {
		return resultFail('No local partner specified for candidate creation');
	}

	try {
		const uniquenessResult = await validateCandidateCreateUniqueness(input);
		if (!uniquenessResult.success) {
			return uniquenessResult;
		}

		const paymentPhone = input.paymentInformation.phone;
		if (paymentPhone) {
			const firebaseResult = await createFirebaseUserByPhoneNumber(paymentPhone);
			if (!firebaseResult.success) {
				return resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
			}
		}

		try {
			return resultOk(await candidateRepository.createCandidate(input, localPartnerId));
		} catch (error) {
			if (paymentPhone) {
				await deleteFirebaseUserByPhoneNumberIfExists(paymentPhone);
			}
			console.error('Could not persist candidate', { error });

			return resultFail('Could not create candidate. Please try again later.');
		}
	} catch (error) {
		console.error('Could not create candidate', { error });

		return resultFail('Could not create candidate. Please try again later.');
	}
};

export const updateCandidate = async (
	session: Session,
	input: CandidateUpdateInput,
): Promise<ServiceResult<CandidatePayload>> => {
	if (session.type === 'contributor') {
		return resultFail('Permission denied');
	}

	let previousPaymentPhone: string | null = null;
	let nextPaymentPhone: string | null = null;
	let firebaseChange: 'added' | 'removed' | 'changed' | null = null;

	try {
		const existing = await candidateRepository.findCandidateForUpdate(input.id);
		if (!existing) {
			return resultFail('Candidate not found');
		}
		if (existing.programId !== null) {
			return resultFail('Not a candidate');
		}
		const accessResult = await validateCandidateAccess(session, existing.localPartnerId);
		if (!accessResult.success) {
			return accessResult;
		}

		const effectiveInput: CandidateUpdateInput =
			session.type === 'local-partner' ? { ...input, localPartnerId: undefined } : input;
		const uniquenessResult = await validateCandidateUpdateUniqueness(effectiveInput, existing);
		if (!uniquenessResult.success) {
			return uniquenessResult;
		}

		previousPaymentPhone = existing.paymentInformation?.phone?.number ?? null;
		nextPaymentPhone = effectiveInput.paymentInformation.phone ?? null;
		if (!previousPaymentPhone && nextPaymentPhone) {
			const result = await createFirebaseUserByPhoneNumber(nextPaymentPhone);
			if (!result.success) {
				return resultFail(`Failed to create Firebase user: ${result.error}`);
			}
			firebaseChange = 'added';
		} else if (previousPaymentPhone && !nextPaymentPhone) {
			await deleteFirebaseUserByPhoneNumberIfExists(previousPaymentPhone);
			firebaseChange = 'removed';
		} else if (previousPaymentPhone && nextPaymentPhone && previousPaymentPhone !== nextPaymentPhone) {
			const result = await updateFirebaseUserByPhoneNumber(previousPaymentPhone, nextPaymentPhone);
			if (!result.success) {
				return resultFail(`Failed to update Firebase user: ${result.error}`);
			}
			firebaseChange = 'changed';
		}

		const updated = await candidateRepository.updateCandidate(effectiveInput, {
			contactId: existing.contact.id,
			contactPhoneId: existing.contact.phone?.id,
			contactPhoneNumber: existing.contact.phone?.number,
			contactAddressId: existing.contact.address?.id,
			paymentInformationId: existing.paymentInformation?.id,
			paymentPhoneId: existing.paymentInformation?.phone?.id,
			paymentPhoneNumber: existing.paymentInformation?.phone?.number,
		});
		await cleanupCandidateRelations(existing, effectiveInput);

		return resultOk(updated);
	} catch (error) {
		console.error('Could not update candidate', { candidateId: input.id, error });
		await compensateFirebaseChange(firebaseChange, previousPaymentPhone, nextPaymentPhone);

		return resultFail('Could not update candidate. Please try again later.');
	}
};

export const deleteCandidate = async (session: Session, candidateId: string): Promise<ServiceResult<{ id: string }>> => {
	if (session.type === 'contributor') {
		return resultFail('Permission denied');
	}

	try {
		const existing = await candidateRepository.findCandidateForDeletion(candidateId);
		if (!existing) {
			return resultFail('Candidate not found');
		}
		const accessResult = await validateCandidateAccess(session, existing.localPartnerId);
		if (!accessResult.success) {
			return accessResult;
		}

		await candidateRepository.deleteCandidateData({
			candidateId,
			contactId: existing.contactId,
			paymentInformationId: existing.paymentInformationId,
		});
		await cleanupDeletedCandidateRelations(candidateId, existing);

		const paymentPhone = existing.paymentInformation?.phone?.number;
		if (paymentPhone) {
			const firebaseResult = await deleteFirebaseUserByPhoneNumberIfExists(paymentPhone);
			if (!firebaseResult.success) {
				console.warn('Candidate deleted in DB but Firebase user deletion failed', {
					candidateId,
					error: firebaseResult.error,
				});
			}
		}

		return resultOk({ id: candidateId });
	} catch (error) {
		console.error('Could not delete candidate', { candidateId, error });

		return resultFail('Could not delete candidate. Please try again later.');
	}
};

export const importCandidatesCsv = async (session: Session, file: File): Promise<ServiceResult<{ created: number }>> => {
	try {
		const rows = parseCsvText(await file.text());
		const candidates: CandidateCreateInput[] = [];
		const errors: string[] = [];

		for (const [index, row] of rows.entries()) {
			const rowNumber = index + 1;
			const mappedResult = mapCsvRowToCandidate(rowNumber, row);
			if (!mappedResult.success) {
				errors.push(mappedResult.error);
				continue;
			}
			const parsedResult = candidateCreateSchema.safeParse(mappedResult.data);
			if (!parsedResult.success) {
				errors.push(`Row ${rowNumber}: ${parsedResult.error.issues[0]?.message ?? 'Invalid input.'}`);
				continue;
			}
			const uniquenessResult = await validateCandidateCreateUniqueness(parsedResult.data);
			if (!uniquenessResult.success) {
				errors.push(`Row ${rowNumber}: ${uniquenessResult.error}`);
				continue;
			}
			candidates.push(parsedResult.data);
		}
		if (errors.length) {
			return resultFail(errors.join('\n'));
		}

		for (const [index, candidate] of candidates.entries()) {
			const result = await createCandidate(session, candidate);
			if (!result.success) {
				return resultFail(`Row ${index + 1}: ${result.error}`);
			}
		}

		return resultOk({ created: candidates.length });
	} catch (error) {
		console.error('Could not import candidates CSV', { error });

		return resultFail(error instanceof Error ? error.message : 'Failed to parse CSV file');
	}
};

export const assignRandomCandidatesToProgram = async (
	programId: string,
	amount: number,
	countryCode: CountryCode,
	focuses?: string[],
	profiles?: Profile[],
): Promise<ServiceResult<{ assigned: number }>> => {
	try {
		const candidates = await candidateRepository.findCandidateIdsForAssignment(focuses, profiles, countryCode);
		if (candidates.length < amount) {
			return resultFail(`Not enough candidates available. Requested ${amount}, but only ${candidates.length} available.`);
		}
		const selectedIds = [...candidates]
			.sort(() => Math.random() - 0.5)
			.slice(0, amount)
			.map(({ id }) => id);
		await candidateRepository.updateCandidateProgramAssignments(selectedIds, programId);

		return resultOk({ assigned: selectedIds.length });
	} catch (error) {
		console.error('Could not assign candidates', { programId, error });

		return resultFail('Could not assign candidates');
	}
};

const getPaginatedCandidates = async (
	query: CandidatesTableQuery,
	localPartnerId?: string,
): Promise<ServiceResult<CandidatesPaginatedTableView>> => {
	try {
		const country = Object.values(CountryCode).find((value) => value === query.country?.trim());
		const gender = Object.values(Gender).find((value) => value === query.gender?.trim());
		const { candidates, totalCount, filterSource } = await candidateRepository.findPaginatedCandidates({
			query,
			localPartnerId,
			country,
			gender,
		});
		const tableRows: CandidatesTableViewRow[] = candidates.map((candidate) => ({
			id: candidate.id,
			firebaseAuthUserId: '',
			country: candidate.contact?.address?.country ?? candidate.localPartner?.contact?.address?.country ?? null,
			firstName: candidate.contact?.firstName ?? '',
			lastName: candidate.contact?.lastName ?? '',
			dateOfBirth: candidate.contact?.dateOfBirth ?? null,
			contactNumber: candidate.contact?.phone?.number ?? null,
			gender: candidate.contact?.gender ?? null,
			localPartnerName: localPartnerId ? null : (candidate.localPartner?.name ?? null),
			suspendedAt: candidate.suspendedAt,
			suspensionReason: candidate.suspensionReason,
		}));
		const countryFilterOptions = [
			...new Set(
				filterSource
					.map((row) => row.contact?.address?.country ?? row.localPartner?.contact?.address?.country ?? null)
					.filter((value): value is CountryCode => value !== null),
			),
		]
			.sort()
			.map((value) => ({ value, label: value }));
		const genderFilterOptions = [
			...new Set(
				filterSource
					.map((row) => row.contact?.gender)
					.filter((value): value is Gender => value !== null && value !== undefined),
			),
		]
			.sort()
			.map((value) => ({ value, label: value }));
		const localPartnerFilterOptions = localPartnerId
			? []
			: [
					...new Map(
						filterSource
							.map(({ localPartner }) => localPartner)
							.filter((partner): partner is NonNullable<typeof partner> => Boolean(partner?.id && partner.name))
							.map((partner) => [partner.id, { value: partner.id, label: partner.name }]),
					).values(),
				].sort((a, b) => a.label.localeCompare(b.label));

		return resultOk({
			tableRows,
			totalCount,
			countryFilterOptions,
			genderFilterOptions,
			localPartnerFilterOptions,
		});
	} catch (error) {
		console.error('Could not fetch candidates', { error });

		return resultFail('Could not fetch candidates');
	}
};

const validateCandidateAccess = async (session: Session, localPartnerId: string): Promise<ServiceResult<true>> => {
	if (session.type === 'user') {
		return isAdmin(session.id);
	}

	return session.type === 'local-partner' && session.id === localPartnerId
		? resultOk(true)
		: resultFail('Permission denied');
};

const validateCandidateCreateUniqueness = async (input: CandidateCreateInput): Promise<ServiceResult<void>> => {
	if (input.contact.phone && input.paymentInformation.phone && input.contact.phone === input.paymentInformation.phone) {
		return resultFail('Contact phone and payment phone must be different.');
	}
	if (input.contact.email && (await candidateRepository.findContactByEmail(input.contact.email))) {
		return resultFail('A contact with this email already exists.');
	}
	if (input.contact.phone && (await candidateRepository.findPhoneByNumber(input.contact.phone))) {
		return resultFail('A contact with this phone number already exists.');
	}
	if (input.paymentInformation.phone && (await candidateRepository.findPhoneByNumber(input.paymentInformation.phone))) {
		return resultFail('A payment phone number with this value already exists.');
	}
	if (
		input.paymentInformation.code &&
		(await candidateRepository.findPaymentInformationByCode(input.paymentInformation.code))
	) {
		return resultFail('A payment code with this value already exists.');
	}

	return resultOk(undefined);
};

const validateCandidateUpdateUniqueness = async (
	input: CandidateUpdateInput,
	existing: NonNullable<Awaited<ReturnType<typeof candidateRepository.findCandidateForUpdate>>>,
): Promise<ServiceResult<void>> => {
	if (input.contact.phone && input.paymentInformation.phone && input.contact.phone === input.paymentInformation.phone) {
		return resultFail('Contact phone and payment phone must be different.');
	}
	if (input.contact.email && input.contact.email !== existing.contact.email) {
		const conflict = await candidateRepository.findContactByEmail(input.contact.email);
		if (conflict && conflict.id !== existing.contact.id) {
			return resultFail('A contact with this email already exists.');
		}
	}
	if (input.contact.phone && input.contact.phone !== existing.contact.phone?.number) {
		const conflict = await candidateRepository.findPhoneByNumber(input.contact.phone);
		if (conflict && conflict.id !== existing.contact.phone?.id) {
			return resultFail('A contact with this phone number already exists.');
		}
	}
	if (input.paymentInformation.phone && input.paymentInformation.phone !== existing.paymentInformation?.phone?.number) {
		const conflict = await candidateRepository.findPhoneByNumber(input.paymentInformation.phone);
		if (conflict && conflict.id !== existing.paymentInformation?.phone?.id) {
			return resultFail('A payment phone number with this value already exists.');
		}
	}
	if (input.paymentInformation.code && input.paymentInformation.code !== existing.paymentInformation?.code) {
		const conflict = await candidateRepository.findPaymentInformationByCode(input.paymentInformation.code);
		if (conflict && conflict.id !== existing.paymentInformation?.id) {
			return resultFail('A payment code with this value already exists.');
		}
	}

	return resultOk(undefined);
};

const cleanupCandidateRelations = async (
	existing: NonNullable<Awaited<ReturnType<typeof candidateRepository.findCandidateForUpdate>>>,
	input: CandidateUpdateInput,
): Promise<void> => {
	if (existing.contact.phone?.id) {
		await candidateRepository.deletePhoneIfOrphaned(existing.contact.phone.id);
	}
	if (existing.paymentInformation?.phone?.id) {
		await candidateRepository.deletePhoneIfOrphaned(existing.paymentInformation.phone.id);
	}
	if (
		existing.contact.address?.id &&
		![input.contact.street, input.contact.number, input.contact.city, input.contact.zip, input.contact.country].some(Boolean)
	) {
		await candidateRepository.deleteAddressIfOrphaned(existing.contact.address.id);
	}
};

const cleanupDeletedCandidateRelations = async (
	candidateId: string,
	existing: NonNullable<Awaited<ReturnType<typeof candidateRepository.findCandidateForDeletion>>>,
): Promise<void> => {
	const cleanups = [
		existing.contact.phoneId ? candidateRepository.deletePhoneIfOrphaned(existing.contact.phoneId) : null,
		existing.paymentInformation?.phone?.id
			? candidateRepository.deletePhoneIfOrphaned(existing.paymentInformation.phone.id)
			: null,
		existing.contact.addressId ? candidateRepository.deleteAddressIfOrphaned(existing.contact.addressId) : null,
	].filter((cleanup): cleanup is Promise<boolean> => cleanup !== null);
	const results = await Promise.allSettled(cleanups);
	if (results.some(({ status }) => status === 'rejected')) {
		console.warn('Candidate deleted but relation cleanup failed', { candidateId });
	}
};

const compensateFirebaseChange = async (
	change: 'added' | 'removed' | 'changed' | null,
	previousPhone: string | null,
	nextPhone: string | null,
): Promise<void> => {
	if (change === 'added' && nextPhone) {
		await deleteFirebaseUserByPhoneNumberIfExists(nextPhone);
	}
	if (change === 'removed' && previousPhone) {
		await createFirebaseUserByPhoneNumber(previousPhone);
	}
	if (change === 'changed' && previousPhone && nextPhone) {
		await updateFirebaseUserByPhoneNumber(nextPhone, previousPhone);
	}
};

const mapCsvRowToCandidate = (rowNumber: number, row: Record<string, string>): ServiceResult<CandidateCreateInput> => {
	if (!row.firstName || !row.lastName) {
		return resultFail(`Row ${rowNumber}: firstName and lastName are required`);
	}
	if (!row.localPartnerId) {
		return resultFail(`Row ${rowNumber}: localPartnerId is required`);
	}
	const optionalFieldsResult = parseCsvOptionalFields(rowNumber, row);
	if (!optionalFieldsResult.success) {
		return resultFail(optionalFieldsResult.error);
	}

	return resultOk({
		suspendedAt: null,
		suspensionReason: null,
		successorName: null,
		termsAccepted: false,
		localPartnerId: row.localPartnerId,
		paymentInformation: {
			mobileMoneyProviderId: undefined,
			code: optionalFieldsResult.data.paymentInformationCode,
			phone: optionalFieldsResult.data.paymentPhone,
		},
		contact: {
			firstName: row.firstName,
			lastName: row.lastName,
			callingName: null,
			email: null,
			gender: optionalFieldsResult.data.gender,
			language: null,
			dateOfBirth: optionalFieldsResult.data.dateOfBirth,
			profession: null,
			phone: optionalFieldsResult.data.contactPhone,
			hasWhatsApp: false,
			street: null,
			number: null,
			city: null,
			zip: null,
			country: null,
		},
	});
};

const CANDIDATE_CSV_HEADERS = [
	'id',
	'createdAt',
	'updatedAt',
	'localPartnerId',
	'localPartnerName',
	'suspendedAt',
	'suspensionReason',
	'successorName',
	'termsAccepted',
	'countryResolved',
	'contactId',
	'contactFirstName',
	'contactLastName',
	'contactCallingName',
	'contactEmail',
	'contactGender',
	'contactLanguage',
	'contactDateOfBirth',
	'contactProfession',
	'contactPhone',
	'contactAddressStreet',
	'contactAddressNumber',
	'contactAddressZip',
	'contactAddressCity',
	'contactAddressCountry',
	'paymentInformationId',
	'paymentMobileMoneyProviderId',
	'paymentMobileMoneyProviderName',
	'paymentCode',
	'paymentPhone',
];
