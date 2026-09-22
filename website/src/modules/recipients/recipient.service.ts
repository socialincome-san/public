import { Currency, Gender, PayoutInterval, PayoutStatus, ProgramPermission } from '@/generated/prisma/enums';
import {
	createFirebaseUserByPhoneNumber,
	decodeFirebaseTokenFromRequest,
	deleteFirebaseUserByPhoneNumberIfExists,
	getPhoneNumberFromFirebaseToken,
	updateFirebaseUserByPhoneNumber,
} from '@/integrations/firebase/firebase-auth.integration';
import type { Session } from '@/lib/firebase/current-account';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { parseCsvOptionalFields, parseCsvText, stringifyCsv } from '@/lib/utils/csv';
import { now } from '@/lib/utils/now';
import { OBFUSCATED_SENTINEL } from '@/lib/utils/obfuscation';
import { getLocalPartnerOptions } from '@/modules/local-partners/local-partner.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import type { ProgramAccess as AccessibleProgram } from '@/modules/program-access/program-access.types';
import { getProgramNameById } from '@/modules/programs/program-reference.service';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import {
	canCreateRecipient,
	canExportRecipients,
	canReadRecipient,
	canRemoveRecipientFromProgram,
	canUpdateRecipient,
	hasOperatorAccess,
} from './recipient.permissions';
import * as recipientRepository from './recipient.repository';
import {
	recipientCreateSchema,
	recipientCsvFileSchema,
	recipientIdSchema,
	recipientSelfUpdateSchema,
	recipientUpdateSchema,
	type CreateRecipientInput,
	type UpdateRecipientInput,
	type UpdateRecipientSelfInput,
} from './recipient.schemas';
import type {
	PublicRecipientTableView,
	PublicRecipientTableViewRow,
	RecipientFormOptions,
	RecipientLifecycleStatus,
	RecipientLifecycleStatusFromExpectedIntervalsInput,
	RecipientLifecycleStatusInput,
	RecipientMessagingTarget,
	RecipientOption,
	RecipientPaginatedTableView,
	RecipientPayload,
	RecipientProgramAssignment,
	RecipientProgramFilterOption,
	RecipientTableQuery,
	RecipientTableView,
	RecipientTableViewRow,
	RecipientUpcomingOnboardingPaginatedTableView,
	RecipientWithPaymentInfo,
	SurveyRecipientOption,
	UnassignedRecipientCountry,
	UpcomingOnboardingTableViewRow,
} from './recipient.types';

const validateRecipientCreateInput = (input: CreateRecipientInput): ServiceResult<CreateRecipientInput> => {
	const parsedInput = recipientCreateSchema.safeParse(input);

	return parsedInput.success
		? resultOk(parsedInput.data)
		: resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
};

const validateRecipientUpdateInput = (input: UpdateRecipientInput): ServiceResult<UpdateRecipientInput> => {
	const parsedInput = recipientUpdateSchema.safeParse(input);

	return parsedInput.success
		? resultOk(parsedInput.data)
		: resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
};

const validateRecipientCreateUniqueness = async (input: CreateRecipientInput): Promise<ServiceResult<void>> => {
	if (input.contact.phone && input.paymentInformation.phone === input.contact.phone) {
		return resultFail('Contact phone and payment phone must be different.');
	}

	if (input.contact.email && (await recipientRepository.findContactByEmail(input.contact.email))) {
		return resultFail('A contact with this email already exists.');
	}

	if (input.contact.phone && (await recipientRepository.findPhoneByNumber(input.contact.phone))) {
		return resultFail('A contact with this phone number already exists.');
	}

	if (input.paymentInformation.phone && (await recipientRepository.findPhoneByNumber(input.paymentInformation.phone))) {
		return resultFail('A payment phone number with this value already exists.');
	}

	if (
		input.paymentInformation.code &&
		(await recipientRepository.findPaymentInformationByCode(input.paymentInformation.code))
	) {
		return resultFail('A payment code with this value already exists.');
	}

	return resultOk(undefined);
};

const validateRecipientUpdateUniqueness = async (
	input: UpdateRecipientInput,
	context: RecipientUpdateUniquenessContext,
): Promise<ServiceResult<void>> => {
	if (input.contact.phone && input.paymentInformation.phone === input.contact.phone) {
		return resultFail('Contact phone and payment phone must be different.');
	}

	if (input.contact.email && input.contact.email !== context.existingEmail) {
		const conflict = await recipientRepository.findContactByEmail(input.contact.email);
		if (conflict && conflict.id !== context.existingContactId) {
			return resultFail('A contact with this email already exists.');
		}
	}

	const contactPhone = input.contact.phone ?? null;
	if (contactPhone && contactPhone !== context.existingContactPhoneNumber) {
		const conflict = await recipientRepository.findPhoneByNumber(contactPhone);
		if (conflict && conflict.id !== context.existingContactPhoneId) {
			return resultFail('A contact with this phone number already exists.');
		}
	}

	const paymentPhone = input.paymentInformation.phone ?? null;
	if (paymentPhone && paymentPhone !== context.existingPaymentPhoneNumber) {
		const conflict = await recipientRepository.findPhoneByNumber(paymentPhone);
		if (conflict && conflict.id !== context.existingPaymentPhoneId) {
			return resultFail('A payment phone number with this value already exists.');
		}
	}

	if (input.paymentInformation.code && input.paymentInformation.code !== context.existingPaymentCode) {
		const conflict = await recipientRepository.findPaymentInformationByCode(input.paymentInformation.code);
		if (conflict && conflict.id !== context.existingPaymentInformationId) {
			return resultFail('A payment code with this value already exists.');
		}
	}

	return resultOk(undefined);
};

export const createRecipient = async (
	session: Session,
	input: CreateRecipientInput,
): Promise<ServiceResult<RecipientWriteResult>> => {
	try {
		const inputResult = validateRecipientCreateInput(input);
		if (!inputResult.success) {
			return resultFail(inputResult.error);
		}

		const recipientInput = inputResult.data;
		if (!recipientInput.programId) {
			return resultFail('No program specified for recipient creation');
		}

		const accessResult = await getActorAccessiblePrograms(session);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		if (!canCreateRecipient(session, recipientInput.programId, accessResult.data)) {
			return resultFail('Permission denied');
		}

		if (session.type === 'local-partner') {
			recipientInput.localPartnerId = session.id;
		}
		if (!recipientInput.localPartnerId) {
			return resultFail('No local partner specified for recipient creation');
		}

		const uniquenessResult = await validateRecipientCreateUniqueness(recipientInput);
		if (!uniquenessResult.success) {
			return resultFail(uniquenessResult.error);
		}

		const createdRecipient = await recipientRepository.createRecipient(recipientInput);
		const paymentPhone = recipientInput.paymentInformation.phone;
		if (!paymentPhone) {
			return resultOk(createdRecipient);
		}

		const firebaseResult = await createFirebaseUserByPhoneNumber(paymentPhone);
		if (firebaseResult.success) {
			return resultOk(createdRecipient);
		}

		await compensateFailedRecipientCreation(createdRecipient.id);

		return resultFail('Could not create recipient. Please try again later.');
	} catch (error) {
		console.error(error);

		return resultFail('Could not create recipient. Please try again later.');
	}
};

export const updateRecipient = async (
	session: Session,
	input: UpdateRecipientInput,
): Promise<ServiceResult<RecipientWriteResult>> => {
	if (session.type === 'contributor') {
		return resultFail('Permission denied');
	}

	const inputResult = validateRecipientUpdateInput(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error);
	}

	const recipientInput = inputResult.data;
	let firebaseCompensation: FirebaseCompensation | null = null;

	try {
		const existing = await recipientRepository.findRecipientForUpdate(recipientInput.id);
		if (!existing) {
			return resultFail('Recipient not found');
		}

		const accessResult = await getActorAccessiblePrograms(session);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		if (!canUpdateRecipient(session, existing, recipientInput.programId, accessResult.data)) {
			return resultFail('Permission denied');
		}

		if (session.type === 'local-partner') {
			recipientInput.localPartnerId = undefined;
			recipientInput.programId = undefined;
		}

		const uniquenessResult = await validateRecipientUpdateUniqueness(recipientInput, {
			existingContactId: existing.contact.id,
			existingEmail: existing.contact.email,
			existingContactPhoneId: existing.contact.phone?.id ?? null,
			existingContactPhoneNumber: existing.contact.phone?.number ?? null,
			existingPaymentInformationId: existing.paymentInformation?.id ?? null,
			existingPaymentCode: existing.paymentInformation?.code ?? null,
			existingPaymentPhoneId: existing.paymentInformation?.phone?.id ?? null,
			existingPaymentPhoneNumber: existing.paymentInformation?.phone?.number ?? null,
		});
		if (!uniquenessResult.success) {
			return resultFail(uniquenessResult.error);
		}

		const previousPaymentPhone = existing.paymentInformation?.phone?.number ?? null;
		const nextPaymentPhone = recipientInput.paymentInformation.phone ?? null;
		const firebaseResult = await synchronizeFirebasePaymentPhone(previousPaymentPhone, nextPaymentPhone);
		if (!firebaseResult.success) {
			return resultFail(firebaseResult.error);
		}
		firebaseCompensation = firebaseResult.data;

		const updatedRecipient = await recipientRepository.updateRecipient(recipientInput, {
			contactId: existing.contact.id,
			contactPhoneId: existing.contact.phone?.id,
			contactPhoneNumber: existing.contact.phone?.number,
			contactAddressId: existing.contact.address?.id,
			paymentInformationId: existing.paymentInformation?.id,
			paymentPhoneId: existing.paymentInformation?.phone?.id,
			paymentPhoneNumber: existing.paymentInformation?.phone?.number,
		});

		await cleanupRecipientRelations({
			contactPhoneId: existing.contact.phone?.id,
			paymentPhoneId: existing.paymentInformation?.phone?.id,
			addressId: hasAddressInput(recipientInput.contact) ? undefined : existing.contact.address?.id,
		});

		return resultOk(updatedRecipient);
	} catch (error) {
		console.error(error);
		if (firebaseCompensation) {
			await compensateFirebaseChange(firebaseCompensation);
		}

		return resultFail('Could not update recipient. Please try again later.');
	}
};

export const updateRecipientSelf = async (
	recipientId: string,
	input: UpdateRecipientSelfInput,
): Promise<ServiceResult<RecipientWithPaymentInfo>> => {
	const recipientIdResult = recipientIdSchema.safeParse(recipientId);
	if (!recipientIdResult.success) {
		return resultFail(recipientIdResult.error.issues[0]?.message ?? 'Recipient id is required.');
	}

	const inputResult = recipientSelfUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	let firebaseCompensation: FirebaseCompensation | null = null;

	try {
		const existing = await recipientRepository.findRecipientForSelfUpdate(recipientIdResult.data);
		if (!existing) {
			return resultFail('Recipient not found');
		}

		const previousPaymentPhone = existing.paymentInformation?.phone?.number ?? null;
		const nextPaymentPhone = inputResult.data.paymentPhone ?? previousPaymentPhone;
		if (previousPaymentPhone && nextPaymentPhone && previousPaymentPhone !== nextPaymentPhone) {
			const firebaseResult = await updateFirebaseUserByPhoneNumber(previousPaymentPhone, nextPaymentPhone);
			if (!firebaseResult.success) {
				return resultFail(`Failed to update Firebase phone number: ${firebaseResult.error}`);
			}
			firebaseCompensation = {
				kind: 'changed',
				previousPhone: previousPaymentPhone,
				nextPhone: nextPaymentPhone,
			};
		}

		const updatedRecipient = await recipientRepository.updateRecipientSelf(
			recipientIdResult.data,
			inputResult.data,
			existing.paymentInformation?.code ?? null,
		);

		await cleanupRecipientRelations({
			contactPhoneId: existing.contact.phone?.id,
			paymentPhoneId: existing.paymentInformation?.phone?.id,
		});

		return resultOk(updatedRecipient);
	} catch (error) {
		console.error(error);
		if (firebaseCompensation) {
			await compensateFirebaseChange(firebaseCompensation);
		}

		return resultFail('Failed to update recipient');
	}
};

export const removeRecipientFromProgram = async (
	session: Session,
	recipientId: string,
): Promise<ServiceResult<{ id: string }>> => {
	try {
		const idResult = recipientIdSchema.safeParse(recipientId);
		if (!idResult.success) {
			return resultFail(idResult.error.issues[0]?.message ?? 'Recipient id is required.');
		}

		const existing = await recipientRepository.findRecipientForProgramRemoval(idResult.data);
		if (!existing) {
			return resultFail('Recipient not found');
		}
		if (!existing.programId) {
			return resultFail('Recipient is already in the pool');
		}

		const accessResult = await getActorAccessiblePrograms(session);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canRemoveRecipientFromProgram(session, existing.programId, accessResult.data)) {
			return resultFail('Permission denied');
		}
		if (existing._count.payouts > 0) {
			return resultFail('Recipient has payouts and cannot be removed from the program.');
		}

		const removal = await recipientRepository.removeRecipientFromProgram(idResult.data, existing.programId);
		if (removal.count === 0) {
			return resultFail(
				'Either the recipient has payouts and cannot be removed from the program, or the program was changed.',
			);
		}

		return resultOk({ id: idResult.data });
	} catch (error) {
		console.error(error);

		return resultFail('Could not remove recipient from program');
	}
};

export const deleteRecipient = async (session: Session, recipientId: string): Promise<ServiceResult<{ id: string }>> => {
	try {
		const idResult = recipientIdSchema.safeParse(recipientId);
		if (!idResult.success) {
			return resultFail(idResult.error.issues[0]?.message ?? 'Recipient id is required.');
		}

		const existing = await recipientRepository.findRecipientForDeletion(idResult.data);
		if (!existing) {
			return resultFail('Recipient not found');
		}

		const accessResult = await getActorAccessiblePrograms(session);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canReadRecipient(session, existing, accessResult.data)) {
			return resultFail('Permission denied');
		}

		await recipientRepository.deleteRecipient({
			recipientId: existing.id,
			contactId: existing.contactId,
			paymentInformationId: existing.paymentInformationId,
		});

		await cleanupRecipientRelations({
			contactPhoneId: existing.contact.phoneId ?? undefined,
			paymentPhoneId: existing.paymentInformation?.phone?.id,
			addressId: existing.contact.addressId ?? undefined,
		});

		const paymentPhone = existing.paymentInformation?.phone?.number;
		if (paymentPhone) {
			const firebaseResult = await deleteFirebaseUserByPhoneNumberIfExists(paymentPhone);
			if (!firebaseResult.success) {
				console.warn('Recipient deleted in DB but Firebase user deletion failed', {
					recipientId: existing.id,
					paymentPhone,
					error: firebaseResult.error,
				});
			}
		}

		return resultOk({ id: existing.id });
	} catch (error) {
		console.error(error);

		return resultFail('Could not delete recipient. Please try again later.');
	}
};

export const getRecipientById = async (session: Session, recipientId: string): Promise<ServiceResult<RecipientPayload>> => {
	try {
		const idResult = recipientIdSchema.safeParse(recipientId);
		if (!idResult.success) {
			return resultFail(idResult.error.issues[0]?.message ?? 'Recipient id is required.');
		}

		const recipient = await recipientRepository.findRecipient(idResult.data);
		if (!recipient) {
			return resultFail('Recipient not found');
		}

		const accessResult = await getActorAccessiblePrograms(session);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (
			!canReadRecipient(
				session,
				{
					programId: recipient.program?.id ?? null,
					localPartnerId: recipient.localPartner.id,
				},
				accessResult.data,
			)
		) {
			return resultFail('Permission denied');
		}

		const address = recipient.contact.address;

		return resultOk({
			...recipient,
			contact: {
				...recipient.contact,
				address: address?.country ? { ...address, country: address.country } : null,
			},
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch recipient');
	}
};

export const getEditableRecipientOptions = async (userId: string): Promise<ServiceResult<RecipientOption[]>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const programIds = accessResult.data
			.filter(({ permission }) => permission === ProgramPermission.operator)
			.map(({ programId }) => programId);
		if (programIds.length === 0) {
			return resultOk([]);
		}

		const recipients = await recipientRepository.findEditableRecipientOptions(programIds);

		return resultOk(
			recipients.map(({ id, contact }) => ({
				id,
				fullName: `${contact.firstName} ${contact.lastName}`,
			})),
		);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch editable recipient options');
	}
};

export const getRecipientFormOptions = async (session: Session): Promise<ServiceResult<RecipientFormOptions>> => {
	if (session.type !== 'user') {
		return resultOk({ programs: [], localPartner: [] });
	}

	try {
		const accessResult = await getAccessiblePrograms(session.id);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const programs = accessResult.data
			.filter(({ permission }) => permission === ProgramPermission.operator)
			.map(({ programId, programName }) => ({ id: programId, name: programName }));
		const localPartnerResult = await getLocalPartnerOptions();
		if (!localPartnerResult.success) {
			return resultFail(localPartnerResult.error);
		}

		return resultOk({ programs, localPartner: localPartnerResult.data });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch recipient options');
	}
};

export const getSurveyRecipients = async (programIds: string[]): Promise<ServiceResult<SurveyRecipientOption[]>> => {
	try {
		return resultOk(await recipientRepository.findSurveyRecipients(programIds, now()));
	} catch (error) {
		console.error(error);

		return resultFail('Could not get survey recipients');
	}
};

const getRecipientByPaymentPhoneNumber = async (
	phoneNumber: string,
): Promise<ServiceResult<RecipientWithPaymentInfo | null>> => {
	try {
		return resultOk(await recipientRepository.findRecipientByPaymentPhoneNumber(phoneNumber));
	} catch (error) {
		console.error(error);

		return resultFail('Could not find recipient by phone number');
	}
};

export const getRecipientProgramAssignment = async (
	recipientId: string,
): Promise<ServiceResult<RecipientProgramAssignment | null>> => {
	try {
		return resultOk(await recipientRepository.findRecipientOwnership(recipientId));
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch recipient program assignment');
	}
};

export const getRecipientMessagingTargets = async (
	recipientIds: string[],
): Promise<ServiceResult<RecipientMessagingTarget[]>> => {
	try {
		return resultOk(await recipientRepository.findRecipientMessagingTargets(recipientIds));
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch recipient messaging targets');
	}
};

export const getAuthenticatedRecipientFromRequest = async (
	request: Request,
): Promise<ServiceResult<RecipientWithPaymentInfo>> => {
	try {
		const tokenResult = await decodeFirebaseTokenFromRequest(request);
		if (!tokenResult.success) {
			return resultFail(tokenResult.error, 401);
		}

		const phone = getPhoneNumberFromFirebaseToken(tokenResult.data);
		if (!phone) {
			return resultFail('Phone number not present in token', 400);
		}

		if (shouldBypassRecipientAuthentication(phone)) {
			return resultOk(createAppReviewRecipient(phone));
		}

		const recipientResult = await getRecipientByPaymentPhoneNumber(phone);
		if (!recipientResult.success) {
			return resultFail(recipientResult.error, 500);
		}

		const recipient = recipientResult.data;
		if (!recipient?.paymentInformation || !recipient.program) {
			return resultFail(`No recipient found for phone "${maskPhoneNumber(phone)}"`, 404);
		}

		return resultOk(recipient);
	} catch (error) {
		console.error(error);

		return resultFail('Could not resolve recipient from request');
	}
};

export const exportRecipientsCsv = async (session: Session): Promise<ServiceResult<string>> => {
	if (!canExportRecipients(session)) {
		return resultFail('Permission denied');
	}

	try {
		const accessResult = await getActorAccessiblePrograms(session);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const programIds =
			session.type === 'user'
				? accessResult.data
						.filter(({ permission }) => permission === ProgramPermission.operator)
						.map(({ programId }) => programId)
				: undefined;
		const recipients = await recipientRepository.findRecipientsForCsvExport({
			programIds,
			localPartnerId: session.type === 'local-partner' ? session.id : undefined,
		});
		const rows = recipients.map((recipient) => ({
			id: recipient.id,
			createdAt: formatCsvDate(recipient.createdAt),
			updatedAt: formatCsvDate(recipient.updatedAt),
			programId: recipient.program?.id ?? '',
			programName: recipient.program?.name ?? '',
			localPartnerId: recipient.localPartner?.id ?? '',
			localPartnerName: recipient.localPartner?.name ?? '',
			startDate: formatCsvDate(recipient.startDate),
			suspendedAt: formatCsvDate(recipient.suspendedAt),
			suspensionReason: recipient.suspensionReason ?? '',
			successorName: recipient.successorName ?? '',
			termsAccepted: recipient.termsAccepted ? 'true' : 'false',
			contactId: recipient.contact?.id ?? '',
			contactFirstName: recipient.contact?.firstName ?? '',
			contactLastName: recipient.contact?.lastName ?? '',
			contactCallingName: recipient.contact?.callingName ?? '',
			contactEmail: recipient.contact?.email ?? '',
			contactGender: recipient.contact?.gender ?? '',
			contactLanguage: recipient.contact?.language ?? '',
			contactDateOfBirth: formatCsvDate(recipient.contact?.dateOfBirth),
			contactProfession: recipient.contact?.profession ?? '',
			contactPhone: recipient.contact?.phone?.number ?? '',
			contactAddressStreet: recipient.contact?.address?.street ?? '',
			contactAddressNumber: recipient.contact?.address?.number ?? '',
			contactAddressZip: recipient.contact?.address?.zip ?? '',
			contactAddressCity: recipient.contact?.address?.city ?? '',
			contactAddressCountry: recipient.contact?.address?.country ?? '',
			paymentInformationId: recipient.paymentInformation?.id ?? '',
			paymentMobileMoneyProviderId: recipient.paymentInformation?.mobileMoneyProvider?.id ?? '',
			paymentMobileMoneyProviderName: recipient.paymentInformation?.mobileMoneyProvider?.name ?? '',
			paymentCode: recipient.paymentInformation?.code ?? '',
			paymentPhone: recipient.paymentInformation?.phone?.number ?? '',
		}));

		return resultOk(stringifyCsv(rows, CSV_HEADERS));
	} catch (error) {
		console.error(error);

		return resultFail('Could not export recipients CSV');
	}
};

export const getPublicRecipientsTableView = async (programId: string): Promise<ServiceResult<PublicRecipientTableView>> => {
	try {
		const programResult = await getProgramNameById(programId);
		if (!programResult.success) {
			return resultFail(programResult.error);
		}

		const { recipients, totalCount } = await recipientRepository.findPublicRecipientTableSource(
			programId,
			PUBLIC_RECIPIENTS_MAX_ROWS,
		);

		return resultOk({
			tableRows: mapPublicRecipientTableRows(recipients, now()),
			totalCount,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch public recipients');
	}
};

const getRecipientTableView = async (userId: string): Promise<ServiceResult<RecipientTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (accessResult.data.length === 0) {
			return resultOk({ tableRows: [], permission: ProgramPermission.owner });
		}

		const recipients = await recipientRepository.findAllRecipientTableSource(
			accessResult.data.map(({ programId }) => programId),
		);

		return resultOk({
			tableRows: mapRecipientTableRows(recipients, accessResult.data, true, now()),
			permission: getTablePermission(accessResult.data),
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch recipients');
	}
};

export const getPaginatedRecipientTableView = async (
	userId: string,
	query: RecipientTableQuery,
): Promise<ServiceResult<RecipientPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		return getPaginatedTableViewForPrograms(
			accessResult.data.filter(({ permission }) => permission === ProgramPermission.operator),
			query,
		);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch recipients');
	}
};

export const getPaginatedRecipientTableViewByProgramId = async (
	userId: string,
	programId: string,
	query: RecipientTableQuery,
): Promise<ServiceResult<RecipientPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		return getPaginatedTableViewForPrograms(
			accessResult.data.filter(({ programId: accessibleProgramId }) => accessibleProgramId === programId),
			{ ...query, programId },
		);
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch program recipients');
	}
};

export const getPaginatedUpcomingOnboardingRecipientTableView = async (
	userId: string,
	query: RecipientTableQuery,
): Promise<ServiceResult<RecipientUpcomingOnboardingPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const programs = accessResult.data.filter(({ permission }) => permission === ProgramPermission.operator);
		const programFilterOptions = getProgramFilterOptions(programs);
		if (programs.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0, programFilterOptions: [] });
		}

		const selectedProgramId = normalizeOptionalFilter(query.programId);
		const programIds = programs.map(({ programId }) => programId);
		if (selectedProgramId && !programIds.includes(selectedProgramId)) {
			return resultOk({ tableRows: [], totalCount: 0, programFilterOptions });
		}

		const today = startOfDay(now());
		const { recipients, totalCount } = await recipientRepository.findUpcomingOnboardingRecipientTableSource({
			programIds,
			query,
			startOfToday: today,
		});
		const tableRows: UpcomingOnboardingTableViewRow[] = recipients.map((recipient) => {
			const startDate = recipient.startDate ?? today;

			return {
				id: recipient.id,
				recipientName: `${recipient.contact?.firstName ?? ''} ${recipient.contact?.lastName ?? ''}`.trim(),
				programId: recipient.program?.id ?? '',
				programName: recipient.program?.name ?? '',
				localPartnerName: recipient.localPartner?.name ?? '',
				communicationPhoneNumber: recipient.contact?.phone?.number ?? null,
				startDate,
				daysUntilStart: differenceInCalendarDays(startOfDay(startDate), today),
				createdAt: recipient.createdAt,
			};
		});

		return resultOk({ tableRows, totalCount, programFilterOptions });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch upcoming onboarding recipients');
	}
};

const getProgramScopedRecipientTableView = async (
	userId: string,
	programId: string,
): Promise<ServiceResult<RecipientTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const tableResult = await getRecipientTableView(userId);
		if (!tableResult.success) {
			return tableResult;
		}

		return resultOk({
			tableRows: tableResult.data.tableRows.filter(({ programId: rowProgramId }) => rowProgramId === programId),
			permission: accessResult.data.some(
				(access) => access.programId === programId && access.permission === ProgramPermission.operator,
			)
				? ProgramPermission.operator
				: ProgramPermission.owner,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch program scoped recipients');
	}
};

const getRecipientTableViewByLocalPartnerId = async (localPartnerId: string): Promise<ServiceResult<RecipientTableView>> => {
	try {
		const result = await getPaginatedRecipientTableViewByLocalPartnerId(localPartnerId, {
			page: 1,
			pageSize: 10_000,
			search: '',
		});
		if (!result.success) {
			return resultFail(result.error);
		}

		return resultOk({ tableRows: result.data.tableRows, permission: result.data.permission });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch local partner recipients table view');
	}
};

export const getPaginatedRecipientTableViewByLocalPartnerId = async (
	localPartnerId: string,
	query: RecipientTableQuery,
): Promise<ServiceResult<RecipientPaginatedTableView>> => {
	try {
		const selectedStatus = parseRecipientStatusFilter(query.recipientStatus);
		const shouldProcessStatus = query.sortBy === 'status' || Boolean(selectedStatus);
		const [{ recipients, totalCount }, filterSource] = await Promise.all([
			recipientRepository.findLocalPartnerRecipientTableSource({
				localPartnerId,
				query,
				paginate: !shouldProcessStatus,
			}),
			recipientRepository.findLocalPartnerRecipientProgramFilterSource(localPartnerId),
		]);

		let tableRows = mapRecipientTableRows(recipients, [], false, now(), ProgramPermission.operator, false);
		tableRows = processStatusRows(tableRows, query, selectedStatus);

		const skip = (query.page - 1) * query.pageSize;
		const programFilterOptions = Array.from(
			new Map(
				filterSource
					.filter(({ program }) => Boolean(program))
					.map(({ program }) => [program?.id ?? '', { id: program?.id ?? '', name: program?.name ?? '' }]),
			).values(),
		)
			.filter(({ id }) => id !== '')
			.sort((left, right) => left.name.localeCompare(right.name));

		return resultOk({
			tableRows: shouldProcessStatus ? tableRows.slice(skip, skip + query.pageSize) : tableRows,
			totalCount: shouldProcessStatus ? tableRows.length : totalCount,
			permission: ProgramPermission.operator,
			programFilterOptions,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch recipients for local partner');
	}
};

export const importRecipientsCsv = async (session: Session, file: File): Promise<ServiceResult<{ created: number }>> => {
	try {
		const fileResult = recipientCsvFileSchema.safeParse(file);
		if (!fileResult.success) {
			return resultFail(fileResult.error.issues[0]?.message ?? 'Invalid CSV file');
		}

		const rows = parseCsvText(await fileResult.data.text());
		const recipients: CreateRecipientInput[] = [];
		const errors: string[] = [];

		for (const [index, row] of rows.entries()) {
			const rowNumber = index + 1;
			const rowResult = mapCsvRowToRecipient(rowNumber, row);
			if (!rowResult.success) {
				errors.push(rowResult.error);
				continue;
			}

			const inputResult = validateRecipientCreateInput(rowResult.data);
			if (!inputResult.success) {
				errors.push(`Row ${rowNumber}: ${inputResult.error}`);
				continue;
			}

			const uniquenessResult = await validateRecipientCreateUniqueness(inputResult.data);
			if (!uniquenessResult.success) {
				errors.push(`Row ${rowNumber}: ${uniquenessResult.error}`);
				continue;
			}

			recipients.push(inputResult.data);
		}

		if (errors.length > 0) {
			return resultFail(errors.join('\n'));
		}

		for (const [index, recipient] of recipients.entries()) {
			const createResult = await createRecipient(session, recipient);
			if (!createResult.success) {
				return resultFail(`Row ${index + 1}: ${createResult.error}`);
			}
		}

		return resultOk({ created: recipients.length });
	} catch (error) {
		console.error(error);

		return resultFail(error instanceof Error ? error.message : 'Failed to parse CSV file');
	}
};

const countPaidOrConfirmedPayouts = (payouts: { status: PayoutStatus }[]): ServiceResult<number> => {
	try {
		return resultOk(
			payouts.filter(({ status }) => status === PayoutStatus.paid || status === PayoutStatus.confirmed).length,
		);
	} catch (error) {
		console.error(error);

		return resultFail('Could not count paid or confirmed payouts');
	}
};

const getExpectedPayoutIntervals = (
	programDurationInMonths: number,
	payoutInterval: PayoutInterval,
): ServiceResult<number> => {
	try {
		if (payoutInterval === PayoutInterval.quarterly) {
			return resultOk(Math.ceil(programDurationInMonths / 3));
		}
		if (payoutInterval === PayoutInterval.yearly) {
			return resultOk(Math.ceil(programDurationInMonths / 12));
		}

		return resultOk(programDurationInMonths);
	} catch (error) {
		console.error(error);

		return resultFail('Could not calculate expected intervals');
	}
};

const getRecipientLifecycleStatusFromExpectedIntervals = (
	input: RecipientLifecycleStatusFromExpectedIntervalsInput,
): ServiceResult<RecipientLifecycleStatus> => {
	try {
		if (input.suspendedAt !== null && input.suspendedAt <= input.nowDate) {
			return resultOk('suspended');
		}
		if (input.startDate === null || input.startDate >= input.nowDate) {
			return resultOk('future');
		}
		if (input.paidOrConfirmedCount >= input.expectedIntervals) {
			return resultOk('completed');
		}

		return resultOk('active');
	} catch (error) {
		console.error(error);

		return resultFail('Could not determine recipient lifecycle status');
	}
};

const getRecipientLifecycleStatus = (input: RecipientLifecycleStatusInput): ServiceResult<RecipientLifecycleStatus> => {
	try {
		const intervalsResult = getExpectedPayoutIntervals(input.programDurationInMonths, input.payoutInterval);
		if (!intervalsResult.success) {
			return resultFail(intervalsResult.error);
		}

		return getRecipientLifecycleStatusFromExpectedIntervals({
			startDate: input.startDate,
			suspendedAt: input.suspendedAt,
			paidOrConfirmedCount: input.paidOrConfirmedCount,
			expectedIntervals: intervalsResult.data,
			nowDate: input.nowDate,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not determine recipient lifecycle status');
	}
};

const isRecipientEligibleForPayout = (input: RecipientLifecycleStatusInput): ServiceResult<boolean> => {
	try {
		const statusResult = getRecipientLifecycleStatus(input);

		return statusResult.success ? resultOk(statusResult.data === 'active') : resultFail(statusResult.error);
	} catch (error) {
		console.error(error);

		return resultFail('Could not determine recipient payout eligibility');
	}
};

export const getUnassignedRecipientCountries = async (): Promise<ServiceResult<UnassignedRecipientCountry[]>> => {
	try {
		const recipients = await recipientRepository.findUnassignedRecipientCountries();

		return resultOk(
			recipients.map((recipient) => ({
				contactCountry: recipient.contact?.address?.country ?? null,
				localPartnerCountry: recipient.localPartner?.contact?.address?.country ?? null,
			})),
		);
	} catch (error) {
		console.error('Could not fetch unassigned recipient countries', { error });

		return resultFail('Could not fetch unassigned recipient countries');
	}
};

export const countRecipientsForProgramsAndLocalPartners = async (
	programIds: string[],
	localPartnerIds: string[],
): Promise<ServiceResult<number>> => {
	try {
		return resultOk(await recipientRepository.countRecipientsForProgramsAndLocalPartners(programIds, localPartnerIds));
	} catch (error) {
		console.error('Could not count recipients for programs and local partners', {
			error,
		});

		return resultFail('Could not count recipients');
	}
};

export const countCandidatesForLocalPartners = async (localPartnerIds: string[]): Promise<ServiceResult<number>> => {
	try {
		return resultOk(await recipientRepository.countCandidatesForLocalPartners(localPartnerIds));
	} catch (error) {
		console.error('Could not count candidates for local partners', { error });

		return resultFail('Could not count candidates');
	}
};

export const recipientService = {
	create: createRecipient,
	update: updateRecipient,
	updateSelf: updateRecipientSelf,
	removeFromProgram: removeRecipientFromProgram,
	delete: deleteRecipient,
	get: getRecipientById,
	getEditableRecipientOptions,
	getFormOptions: getRecipientFormOptions,
	getSurveyRecipients,
	getByPaymentPhoneNumber: getRecipientByPaymentPhoneNumber,
	getRecipientFromRequest: getAuthenticatedRecipientFromRequest,
	exportCsv: exportRecipientsCsv,
	getPublicRecipientsTableView,
	getTableView: getRecipientTableView,
	getPaginatedTableView: getPaginatedRecipientTableView,
	getPaginatedTableViewByProgramId: getPaginatedRecipientTableViewByProgramId,
	getPaginatedUpcomingOnboardingTableView: getPaginatedUpcomingOnboardingRecipientTableView,
	getTableViewProgramScoped: getProgramScopedRecipientTableView,
	getTableViewByLocalPartnerId: getRecipientTableViewByLocalPartnerId,
	getPaginatedTableViewByLocalPartnerId: getPaginatedRecipientTableViewByLocalPartnerId,
	importCsv: importRecipientsCsv,
};

export const recipientStatusService = {
	countPaidOrConfirmedPayouts,
	getExpectedIntervals: getExpectedPayoutIntervals,
	getRecipientLifecycleStatus,
	getRecipientLifecycleStatusFromExpectedIntervals,
	isRecipientEligibleForPayout,
};

const getActorAccessiblePrograms = async (session: Session): Promise<ServiceResult<AccessibleProgram[]>> =>
	session.type === 'user' ? getAccessiblePrograms(session.id) : resultOk([]);

const synchronizeFirebasePaymentPhone = async (
	previousPhone: string | null,
	nextPhone: string | null,
): Promise<ServiceResult<FirebaseCompensation | null>> => {
	if (!previousPhone && !nextPhone) {
		return resultOk(null);
	}
	if (!previousPhone && nextPhone) {
		const result = await createFirebaseUserByPhoneNumber(nextPhone);

		return result.success
			? resultOk({ kind: 'added', nextPhone })
			: resultFail(`Failed to create Firebase user: ${result.error}`);
	}
	if (previousPhone && !nextPhone) {
		const result = await deleteFirebaseUserByPhoneNumberIfExists(previousPhone);

		return result.success
			? resultOk({ kind: 'removed', previousPhone })
			: resultFail(`Failed to delete Firebase user: ${result.error}`);
	}
	if (previousPhone && nextPhone && previousPhone !== nextPhone) {
		const result = await updateFirebaseUserByPhoneNumber(previousPhone, nextPhone);

		return result.success
			? resultOk({ kind: 'changed', previousPhone, nextPhone })
			: resultFail(`Failed to update Firebase user: ${result.error}`);
	}

	return resultOk(null);
};

const compensateFirebaseChange = async (compensation: FirebaseCompensation): Promise<void> => {
	if (compensation.kind === 'added') {
		await deleteFirebaseUserByPhoneNumberIfExists(compensation.nextPhone);
	}
	if (compensation.kind === 'removed') {
		await createFirebaseUserByPhoneNumber(compensation.previousPhone);
	}
	if (compensation.kind === 'changed') {
		await updateFirebaseUserByPhoneNumber(compensation.nextPhone, compensation.previousPhone);
	}
};

const compensateFailedRecipientCreation = async (recipientId: string): Promise<void> => {
	try {
		const recipient = await recipientRepository.findRecipientForDeletion(recipientId);
		if (!recipient) {
			return;
		}

		await recipientRepository.deleteRecipient({
			recipientId,
			contactId: recipient.contactId,
			paymentInformationId: recipient.paymentInformationId,
		});
		await cleanupRecipientRelations({
			contactPhoneId: recipient.contact.phoneId ?? undefined,
			paymentPhoneId: recipient.paymentInformation?.phone?.id,
			addressId: recipient.contact.addressId ?? undefined,
		});
	} catch (error) {
		console.error('Failed to compensate recipient creation', { recipientId, error });
	}
};

const cleanupRecipientRelations = async ({
	contactPhoneId,
	paymentPhoneId,
	addressId,
}: RecipientRelationCleanup): Promise<void> => {
	for (const phoneId of new Set([contactPhoneId, paymentPhoneId].filter(isDefined))) {
		try {
			await recipientRepository.deletePhoneIfOrphaned(phoneId);
		} catch (error) {
			console.warn('Recipient phone cleanup failed', { phoneId, error });
		}
	}

	if (addressId) {
		try {
			await recipientRepository.deleteAddressIfOrphaned(addressId);
		} catch (error) {
			console.warn('Recipient address cleanup failed', { addressId, error });
		}
	}
};

const getPaginatedTableViewForPrograms = async (
	programs: AccessibleProgram[],
	query: RecipientTableQuery,
): Promise<ServiceResult<RecipientPaginatedTableView>> => {
	const permission = getTablePermission(programs);
	const programFilterOptions = getProgramFilterOptions(programs);
	if (programs.length === 0) {
		return resultOk({ tableRows: [], totalCount: 0, permission, programFilterOptions });
	}

	const selectedProgramId = normalizeOptionalFilter(query.programId);
	const programIds = programs.map(({ programId }) => programId);
	if (selectedProgramId && !programIds.includes(selectedProgramId)) {
		return resultOk({ tableRows: [], totalCount: 0, permission, programFilterOptions });
	}

	const selectedStatus = parseRecipientStatusFilter(query.recipientStatus);
	const shouldProcessStatus = query.sortBy === 'status' || Boolean(selectedStatus);
	const { recipients, totalCount } = await recipientRepository.findRecipientTableSource({
		programIds,
		query,
		canSearchRecipientNames: permission === ProgramPermission.operator,
		paginate: !shouldProcessStatus,
	});

	let tableRows = mapRecipientTableRows(recipients, programs, true, now());
	tableRows = processStatusRows(tableRows, query, selectedStatus);
	const skip = (query.page - 1) * query.pageSize;

	return resultOk({
		tableRows: shouldProcessStatus ? tableRows.slice(skip, skip + query.pageSize) : tableRows,
		totalCount: shouldProcessStatus ? tableRows.length : totalCount,
		permission,
		programFilterOptions,
	});
};

const mapRecipientTableRows = (
	recipients: RecipientTableSource,
	programs: AccessibleProgram[],
	showLocalPartnerName: boolean,
	nowDate: Date,
	fixedPermission?: ProgramPermission,
	useProgramPermissions = true,
): RecipientTableViewRow[] =>
	recipients.map((recipient) => {
		const permission =
			fixedPermission ??
			(useProgramPermissions ? getProgramPermission(programs, recipient.program?.id ?? null) : ProgramPermission.operator);
		const payoutsReceived = recipient.payouts.length;
		const payoutsTotal = recipient.program?.programDurationInMonths ?? 0;
		const paidCountResult = countPaidOrConfirmedPayouts(recipient.payouts);
		const statusResult = recipient.program
			? getRecipientLifecycleStatus({
					startDate: recipient.startDate,
					suspendedAt: recipient.suspendedAt,
					paidOrConfirmedCount: paidCountResult.success ? paidCountResult.data : 0,
					programDurationInMonths: recipient.program.programDurationInMonths,
					payoutInterval: recipient.program.payoutInterval,
					nowDate,
				})
			: resultOk<RecipientLifecycleStatus>('future');

		return {
			id: recipient.id,
			firebaseAuthUserId: recipient.localPartner?.account?.firebaseAuthUserId ?? '',
			country: recipient.contact?.address?.country ?? recipient.localPartner?.contact?.address?.country ?? null,
			firstName: permission === ProgramPermission.operator ? (recipient.contact?.firstName ?? '') : OBFUSCATED_SENTINEL,
			lastName: permission === ProgramPermission.operator ? (recipient.contact?.lastName ?? '') : '',
			paymentCode:
				permission === ProgramPermission.operator ? (recipient.paymentInformation?.code ?? null) : OBFUSCATED_SENTINEL,
			dateOfBirth:
				permission === ProgramPermission.operator ? (recipient.contact?.dateOfBirth ?? null) : OBFUSCATED_SENTINEL,
			startDate: recipient.startDate,
			localPartnerName: showLocalPartnerName ? (recipient.localPartner?.name ?? null) : null,
			suspendedAt: recipient.suspendedAt,
			suspensionReason: recipient.suspensionReason,
			programId: recipient.program?.id ?? null,
			programName: recipient.program?.name ?? null,
			payoutsReceived,
			payoutsTotal,
			payoutsProgressPercent: payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0,
			createdAt: recipient.createdAt,
			status: statusResult.success ? statusResult.data : 'future',
		};
	});

const mapPublicRecipientTableRows = (recipients: PublicRecipientTableSource, nowDate: Date): PublicRecipientTableViewRow[] =>
	recipients.map((recipient) => {
		const payoutsTotal = recipient.program?.programDurationInMonths ?? 0;
		const paidCountResult = countPaidOrConfirmedPayouts(recipient.payouts);
		const statusResult = recipient.program
			? getRecipientLifecycleStatus({
					startDate: recipient.startDate,
					suspendedAt: recipient.suspendedAt,
					paidOrConfirmedCount: paidCountResult.success ? paidCountResult.data : 0,
					programDurationInMonths: recipient.program.programDurationInMonths,
					payoutInterval: recipient.program.payoutInterval,
					nowDate,
				})
			: resultOk<RecipientLifecycleStatus>('future');

		return {
			country: recipient.contact?.address?.country ?? recipient.localPartner?.contact?.address?.country ?? null,
			firstName: OBFUSCATED_SENTINEL,
			lastName: '',
			dateOfBirth: OBFUSCATED_SENTINEL,
			startDate: recipient.startDate,
			localPartnerName: recipient.localPartner?.name ?? null,
			payoutsProgressPercent: payoutsTotal > 0 ? Math.round((recipient.payouts.length / payoutsTotal) * 100) : 0,
			createdAt: recipient.createdAt,
			status: statusResult.success ? statusResult.data : 'future',
		};
	});

const processStatusRows = (
	rows: RecipientTableViewRow[],
	query: RecipientTableQuery,
	status: RecipientLifecycleStatus | undefined,
): RecipientTableViewRow[] => {
	const filteredRows = status ? rows.filter((row) => row.status === status) : rows;
	if (query.sortBy !== 'status') {
		return filteredRows;
	}

	const direction = query.sortDirection === 'asc' ? 1 : -1;

	return [...filteredRows].sort((left, right) => {
		const statusDifference = (getRecipientStatusRank(left.status) - getRecipientStatusRank(right.status)) * direction;
		if (statusDifference !== 0) {
			return statusDifference;
		}

		const firstNameDifference = left.firstName.localeCompare(right.firstName) * direction;

		return firstNameDifference !== 0 ? firstNameDifference : left.lastName.localeCompare(right.lastName) * direction;
	});
};

const mapCsvRowToRecipient = (rowNumber: number, row: Record<string, string>): ServiceResult<CreateRecipientInput> => {
	if (!row.firstName || !row.lastName) {
		return resultFail(`Row ${rowNumber}: firstName and lastName are required`);
	}
	if (!row.programId) {
		return resultFail(`Row ${rowNumber}: programId is required`);
	}
	if (!row.localPartnerId) {
		return resultFail(`Row ${rowNumber}: localPartnerId is required`);
	}

	const optionalFieldsResult = parseCsvOptionalFields(rowNumber, row);
	if (!optionalFieldsResult.success) {
		return resultFail(optionalFieldsResult.error);
	}

	return resultOk({
		startDate: null,
		suspendedAt: null,
		suspensionReason: null,
		successorName: null,
		termsAccepted: false,
		programId: row.programId,
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

const createAppReviewRecipient = (phone: string): RecipientWithPaymentInfo => {
	const currentDate = now();

	return {
		id: 'app-review-recipient-tony',
		legacyFirestoreId: null,
		contactId: 'tony-stark-contact',
		startDate: new Date('1970-05-29T00:00:00.000Z'),
		suspendedAt: null,
		suspensionReason: null,
		successorName: 'Pepper Potts',
		termsAccepted: true,
		paymentInformationId: 'stark-payment-info',
		programId: 'avengers-program',
		localPartnerId: 'stark-industries-partner',
		createdAt: currentDate,
		updatedAt: currentDate,
		localPartner: {
			id: 'stark-industries-partner',
			accountId: 'stark-industries-account',
			legacyFirestoreId: null,
			name: 'Stark Industries',
			slug: 'stark-industries',
			contactId: 'stark-industries-contact',
			createdAt: currentDate,
			updatedAt: currentDate,
			contact: {
				id: 'stark-industries-contact',
				firstName: 'Pepper',
				lastName: 'Potts',
				callingName: null,
				email: 'pepper@starkindustries.com',
				gender: Gender.female,
				language: 'en',
				dateOfBirth: null,
				profession: 'CEO',
				phoneId: 'stark-industries-phone',
				isInstitution: true,
				createdAt: currentDate,
				updatedAt: currentDate,
				phone: {
					id: 'stark-industries-phone',
					number: phone,
					hasWhatsApp: false,
					createdAt: currentDate,
					updatedAt: currentDate,
				},
			},
		},
		program: {
			id: 'avengers-program',
			name: 'Avengers Initiative',
			slug: 'avengers-initiative',
			amountOfRecipientsForStart: 6,
			coveredByReserves: false,
			programDurationInMonths: 60,
			payoutPerInterval: {
				toJSON: () => '500',
				toString: () => '500',
			},
			payoutInterval: PayoutInterval.monthly,
			targetProfiles: [],
			countryId: 'usa',
			country: { isoCode: 'US', currency: Currency.USD },
			createdAt: currentDate,
			updatedAt: currentDate,
		},
		contact: {
			id: 'tony-stark-contact',
			firstName: 'Tony',
			lastName: 'Stark',
			callingName: 'Iron Man',
			email: 'tony@starkindustries.com',
			gender: Gender.male,
			language: 'en',
			dateOfBirth: new Date('1970-05-29'),
			profession: 'Genius, billionaire, playboy, philanthropist',
			phoneId: 'tony-stark-phone',
			isInstitution: false,
			createdAt: currentDate,
			updatedAt: currentDate,
			phone: {
				id: 'tony-stark-phone',
				number: phone,
				hasWhatsApp: true,
				createdAt: currentDate,
				updatedAt: currentDate,
			},
		},
		paymentInformation: {
			id: 'stark-payment-info',
			code: 'IRONMAN',
			mobileMoneyProviderId: 'mobile-money-provider-id-1',
			mobileMoneyProvider: {
				id: 'mobile-money-provider-id-1',
				name: 'Orange Money',
				payoutProcess: null,
				parentId: null,
				createdAt: currentDate,
				updatedAt: currentDate,
			},
			phoneId: 'ironman-payment-phone',
			createdAt: currentDate,
			updatedAt: currentDate,
			phone: {
				id: 'ironman-payment-phone',
				number: phone,
				hasWhatsApp: true,
				createdAt: currentDate,
				updatedAt: currentDate,
			},
		},
	};
};

const shouldBypassRecipientAuthentication = (phone: string): boolean => {
	const reviewPhone = process.env.APP_REVIEW_PHONE_NUMBER;

	return (
		process.env.APP_REVIEW_MODE_ENABLED === 'true' &&
		Boolean(reviewPhone) &&
		(phone === reviewPhone || `+${phone}` === reviewPhone)
	);
};

const maskPhoneNumber = (phone: string): string => `${phone.slice(0, 2)}****${phone.slice(-2)}`;

const getTablePermission = (programs: AccessibleProgram[]): ProgramPermission =>
	programs.some(({ permission }) => permission === ProgramPermission.operator)
		? ProgramPermission.operator
		: ProgramPermission.owner;

const getProgramPermission = (programs: AccessibleProgram[], programId: string | null): ProgramPermission =>
	programId && hasOperatorAccess(programs, programId) ? ProgramPermission.operator : ProgramPermission.owner;

const getProgramFilterOptions = (programs: AccessibleProgram[]): RecipientProgramFilterOption[] =>
	Array.from(
		new Map(programs.map(({ programId, programName }) => [programId, { id: programId, name: programName }])).values(),
	);

const parseRecipientStatusFilter = (status: string | undefined): RecipientLifecycleStatus | undefined =>
	status === 'future' || status === 'active' || status === 'suspended' || status === 'completed' ? status : undefined;

const getRecipientStatusRank = (status: RecipientLifecycleStatus): number => {
	switch (status) {
		case 'future':
			return 0;
		case 'active':
			return 1;
		case 'suspended':
			return 2;
		case 'completed':
			return 3;
	}
};

const normalizeOptionalFilter = (value: string | undefined): string | undefined => {
	const normalizedValue = value?.trim();
	if (!normalizedValue) {
		return undefined;
	}

	return normalizedValue;
};

const formatCsvDate = (value: Date | null | undefined): string => (value ? value.toISOString() : '');

const hasAddressInput = (contact: CreateRecipientInput['contact']): boolean =>
	[contact.street, contact.number, contact.city, contact.zip, contact.country].some((value) => Boolean(value));

const isDefined = (value: string | undefined): value is string => value !== undefined;

const PUBLIC_RECIPIENTS_MAX_ROWS = 1000;

const CSV_HEADERS = [
	'id',
	'createdAt',
	'updatedAt',
	'programId',
	'programName',
	'localPartnerId',
	'localPartnerName',
	'startDate',
	'suspendedAt',
	'suspensionReason',
	'successorName',
	'termsAccepted',
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

type RecipientWriteResult = Awaited<ReturnType<typeof recipientRepository.updateRecipient>>;

type RecipientTableSource = Awaited<ReturnType<typeof recipientRepository.findRecipientTableSource>>['recipients'];

type PublicRecipientTableSource = Awaited<
	ReturnType<typeof recipientRepository.findPublicRecipientTableSource>
>['recipients'];

type RecipientUpdateUniquenessContext = {
	existingContactId: string;
	existingEmail: string | null;
	existingContactPhoneId: string | null;
	existingContactPhoneNumber: string | null;
	existingPaymentInformationId: string | null;
	existingPaymentCode: string | null;
	existingPaymentPhoneId: string | null;
	existingPaymentPhoneNumber: string | null;
};

type RecipientRelationCleanup = {
	contactPhoneId?: string;
	paymentPhoneId?: string;
	addressId?: string;
};

type FirebaseCompensation =
	| { kind: 'added'; nextPhone: string }
	| { kind: 'removed'; previousPhone: string }
	| { kind: 'changed'; previousPhone: string; nextPhone: string };
