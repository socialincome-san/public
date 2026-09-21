import {
	createFirebaseUserByEmail,
	deleteFirebaseUserByUidIfExists,
	findFirebaseUserByEmail,
	updateFirebaseUserByUid,
} from '@/integrations/firebase/firebase-auth.integration';
import type { Session } from '@/lib/firebase/current-account';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { isAdmin } from '@/modules/users/user.service';
import * as localPartnerRepository from './local-partner.repository';
import type { LocalPartnerCreateInput, LocalPartnerUpdateInput } from './local-partner.schemas';
import type {
	LocalPartnerMessagingTarget,
	LocalPartnerOption,
	LocalPartnerPaginatedTableView,
	LocalPartnerPayload,
	LocalPartnerSession,
	LocalPartnerTableQuery,
	PublicLocalPartnerOverviewStatsMap,
	PublicLocalPartnerStatsMap,
	PublicProgramLocalPartner,
} from './local-partner.types';

type LocalPartnerRecord = NonNullable<Awaited<ReturnType<typeof localPartnerRepository.findLocalPartnerById>>>;

export const getPublicLocalPartnersByProgramId = async (
	programId: string,
): Promise<ServiceResult<PublicProgramLocalPartner[]>> => {
	const normalizedProgramId = programId.trim();
	if (!normalizedProgramId) {
		return resultFail('Missing program id');
	}

	try {
		return resultOk(await localPartnerRepository.findPublicLocalPartnersByProgramId(normalizedProgramId));
	} catch (error) {
		console.error('Could not fetch local partners for program', { programId, error });

		return resultFail('Could not fetch local partners for program');
	}
};

export const getPublicLocalPartnerOverviewStatsBySlugs = async (
	localPartnerSlugs: string[],
): Promise<ServiceResult<PublicLocalPartnerOverviewStatsMap>> => {
	const normalizedSlugs = [...new Set(localPartnerSlugs.map((slug) => slug.trim()).filter(Boolean))];
	if (normalizedSlugs.length === 0) {
		return resultOk({});
	}

	try {
		const partners = await localPartnerRepository.findLocalPartnersBySlugs(normalizedSlugs);
		const statsResult = await getPublicLocalPartnerStatsByIds(partners.map(({ id }) => id));
		if (!statsResult.success) {
			return resultFail(statsResult.error);
		}

		return resultOk(
			Object.fromEntries(
				partners.map(({ id, slug }) => {
					const stats = statsResult.data[id];

					return [
						slug,
						{
							recipientsCount: stats?.assignedRecipientsCount ?? 0,
							candidatesCount: stats?.waitingRecipientsCount ?? 0,
						},
					];
				}),
			),
		);
	} catch (error) {
		console.error('Could not fetch local partner overview stats', { error });

		return resultFail('Could not fetch local partner overview stats');
	}
};

export const getProgramRecipientCountsByLocalPartnerSlug = async (
	localPartnerSlug: string,
): Promise<ServiceResult<Record<string, number>>> => {
	const normalizedSlug = localPartnerSlug.trim();
	if (!normalizedSlug) {
		return resultOk({});
	}

	try {
		const groups = await localPartnerRepository.groupProgramRecipientCountsByLocalPartnerSlug(normalizedSlug);
		const counts: Record<string, number> = {};
		for (const group of groups) {
			if (group.programId) {
				counts[group.programId] = group._count._all;
			}
		}

		return resultOk(counts);
	} catch (error) {
		console.error('Could not fetch program recipient counts', { error });

		return resultFail('Could not fetch program recipient counts');
	}
};

export const getPublicLocalPartnerDashboardStatsBySlug = async (
	localPartnerSlug: string,
): Promise<ServiceResult<{ recipientsCount: number; completedSurveysCount: number }>> => {
	const normalizedSlug = localPartnerSlug.trim();
	if (!normalizedSlug) {
		return resultFail('Missing local partner slug');
	}

	try {
		const partner = await localPartnerRepository.findLocalPartnerIdBySlug(normalizedSlug);
		if (!partner) {
			return resultFail('Local partner not found');
		}
		const [recipientsCount, completedSurveysCount] = await Promise.all([
			localPartnerRepository.countAssignedRecipientsByLocalPartnerId(partner.id),
			localPartnerRepository.countCompletedSurveysByLocalPartnerId(partner.id),
		]);

		return resultOk({ recipientsCount, completedSurveysCount });
	} catch (error) {
		console.error('Could not fetch local partner dashboard stats', { error });

		return resultFail('Could not fetch local partner dashboard stats');
	}
};

export const getLocalPartner = async (
	userId: string,
	localPartnerId: string,
): Promise<ServiceResult<LocalPartnerPayload>> => {
	try {
		const adminResult = await isAdmin(userId);
		if (!adminResult.success) {
			return resultFail(adminResult.error);
		}

		const partner = await localPartnerRepository.findLocalPartnerById(localPartnerId);

		return partner ? resultOk(toLocalPartnerPayload(partner)) : resultFail('Could not get local partner');
	} catch (error) {
		console.error('Could not get local partner', { localPartnerId, error });

		return resultFail('Could not get local partner');
	}
};

export const getPaginatedLocalPartnerTableView = async (
	userId: string,
	query: LocalPartnerTableQuery,
): Promise<ServiceResult<LocalPartnerPaginatedTableView>> => {
	try {
		const adminResult = await isAdmin(userId);
		if (!adminResult.success) {
			return resultFail(adminResult.error);
		}

		const { partners, totalCount, assignedRecipientGroups } = await localPartnerRepository.findPaginatedLocalPartners(query);
		const assignedCounts = new Map(
			assignedRecipientGroups.map(({ localPartnerId, _count }) => [localPartnerId, _count._all]),
		);

		return resultOk({
			tableRows: partners.map((partner) => {
				const recipientsCount = assignedCounts.get(partner.id) ?? 0;

				return {
					id: partner.id,
					name: partner.name,
					contactPerson: `${partner.contact?.firstName ?? ''} ${partner.contact?.lastName ?? ''}`.trim(),
					email: partner.contact?.email ?? null,
					firebaseAuthUserId: partner.account.firebaseAuthUserId,
					contactNumber: partner.contact?.phone?.number ?? null,
					focuses: partner.focuses.map(({ focus }) => focus.name).join(', '),
					recipientsCount,
					candidatesCount: Math.max(0, partner._count.recipients - recipientsCount),
					createdAt: partner.createdAt,
					country: partner.contact?.address?.country ?? null,
				};
			}),
			totalCount,
		});
	} catch (error) {
		console.error('Could not fetch local partners', { userId, error });

		return resultFail('Could not fetch local partners');
	}
};

export const getLocalPartnerOptions = async (): Promise<ServiceResult<LocalPartnerOption[]>> => {
	try {
		return resultOk(await localPartnerRepository.findLocalPartnerOptions());
	} catch (error) {
		console.error('Could not fetch local partner options', { error });

		return resultFail('Could not fetch local partners');
	}
};

export const getLocalPartnerMessagingTargets = async (
	localPartnerIds: string[],
): Promise<ServiceResult<LocalPartnerMessagingTarget[]>> => {
	try {
		return resultOk(await localPartnerRepository.findLocalPartnerMessagingTargets(localPartnerIds));
	} catch (error) {
		console.error('Could not fetch local partner messaging targets', { error });

		return resultFail('Could not fetch local partner messaging targets');
	}
};

export const getLocalPartnerIdBySlug = async (slug: string): Promise<ServiceResult<string>> => {
	const normalizedSlug = slug.trim();
	if (!normalizedSlug) {
		return resultFail('Missing local partner slug');
	}

	try {
		const localPartner = await localPartnerRepository.findLocalPartnerIdBySlug(normalizedSlug);

		return localPartner ? resultOk(localPartner.id) : resultFail('Local partner not found');
	} catch (error) {
		console.error('Could not fetch local partner by slug', { slug, error });

		return resultFail('Could not fetch local partner');
	}
};

export const getCurrentLocalPartnerSession = async (
	firebaseAuthUserId: string,
): Promise<ServiceResult<LocalPartnerSession>> => {
	try {
		const partner = await localPartnerRepository.findLocalPartnerSession(firebaseAuthUserId);
		if (!partner) {
			return resultFail('Local partner not found');
		}

		return resultOk({
			type: 'local-partner',
			id: partner.id,
			name: partner.name,
			focuses: partner.focuses.map(({ focusId }) => focusId),
			gender: partner.contact?.gender ?? null,
			email: partner.contact?.email ?? null,
			firstName: partner.contact?.firstName ?? null,
			lastName: partner.contact?.lastName ?? null,
			language: partner.contact?.language ?? null,
			street: partner.contact?.address?.street ?? null,
			number: partner.contact?.address?.number ?? null,
			city: partner.contact?.address?.city ?? null,
			zip: partner.contact?.address?.zip ?? null,
			country: partner.contact?.address?.country ?? null,
		});
	} catch (error) {
		console.error('Could not fetch local partner session', { firebaseAuthUserId, error });

		return resultFail('Could not fetch local partner session');
	}
};

export const createLocalPartner = async (
	userId: string,
	input: LocalPartnerCreateInput,
): Promise<ServiceResult<LocalPartnerPayload>> => {
	const adminResult = await isAdmin(userId);
	if (!adminResult.success) {
		return resultFail(adminResult.error);
	}

	try {
		const uniquenessResult = await validateCreateUniqueness(input);
		if (!uniquenessResult.success) {
			return uniquenessResult;
		}

		const displayName = `${input.contact.firstName} ${input.contact.lastName}`.trim();
		const existingFirebaseUserResult = await findFirebaseUserByEmail(input.contact.email);
		if (!existingFirebaseUserResult.success) {
			return resultFail(existingFirebaseUserResult.error);
		}
		const firebaseUserResult = existingFirebaseUserResult.data
			? resultOk(existingFirebaseUserResult.data)
			: await createFirebaseUserByEmail({ email: input.contact.email, displayName });
		if (!firebaseUserResult.success) {
			return resultFail(`Failed to create Firebase user: ${firebaseUserResult.error}`);
		}

		const firebaseSyncResult = await updateFirebaseUserByUid(firebaseUserResult.data.uid, {
			email: input.contact.email,
			displayName,
		});
		if (!firebaseSyncResult.success) {
			console.warn('Could not fully sync Firebase Auth user on local partner creation', {
				firebaseUid: firebaseUserResult.data.uid,
				error: firebaseSyncResult.error,
			});
		}

		const partner = await localPartnerRepository.createLocalPartner(input, firebaseUserResult.data.uid);

		return resultOk(toLocalPartnerPayload(partner));
	} catch (error) {
		console.error('Could not create local partner', { error });

		return resultFail('Could not create local partner. Please try again later.');
	}
};

export const updateLocalPartner = async (
	session: Session,
	input: LocalPartnerUpdateInput,
): Promise<ServiceResult<LocalPartnerPayload>> => {
	try {
		if (session.type === 'contributor') {
			return resultFail('Permission denied');
		}
		const partnerId = session.type === 'local-partner' ? session.id : input.id;
		if (!partnerId) {
			return resultFail('Invalid local partner reference.');
		}
		if (session.type === 'user') {
			const adminResult = await isAdmin(session.id);
			if (!adminResult.success) {
				return resultFail(adminResult.error);
			}
		}

		const existing = await localPartnerRepository.findLocalPartnerForUpdate(partnerId);
		if (!existing) {
			return resultFail('Local partner not found');
		}
		const uniquenessResult = await validateUpdateUniqueness(input, existing);
		if (!uniquenessResult.success) {
			return uniquenessResult;
		}

		const newDisplayName = `${input.contact.firstName} ${input.contact.lastName}`.trim();
		const oldDisplayName = `${existing.contact.firstName} ${existing.contact.lastName}`.trim();
		if (input.contact.email !== existing.contact.email || newDisplayName !== oldDisplayName) {
			const firebaseResult = await updateFirebaseUserByUid(existing.account.firebaseAuthUserId, {
				email: input.contact.email,
				displayName: newDisplayName,
			});
			if (!firebaseResult.success) {
				console.warn('Could not update Firebase Auth user', { error: firebaseResult.error });
			}
		}

		const updated = await localPartnerRepository.updateLocalPartner(partnerId, input, {
			contactId: existing.contact.id,
			phoneId: existing.contact.phone?.id,
			phoneNumber: existing.contact.phone?.number,
			addressId: existing.contact.address?.id,
		});
		if (existing.contact.phone?.id && (!input.contact.phone || input.contact.phone !== existing.contact.phone.number)) {
			await localPartnerRepository.deletePhoneIfOrphaned(existing.contact.phone.id);
		}
		if (
			existing.contact.address?.id &&
			![input.contact.street, input.contact.number, input.contact.city, input.contact.zip, input.contact.country].some(
				Boolean,
			)
		) {
			await localPartnerRepository.deleteAddressIfOrphaned(existing.contact.address.id);
		}

		return resultOk(toLocalPartnerPayload(updated));
	} catch (error) {
		console.error('Could not update local partner', { error });

		return resultFail('Could not update local partner. Please try again later.');
	}
};

export const deleteLocalPartner = async (userId: string, localPartnerId: string): Promise<ServiceResult<{ id: string }>> => {
	const adminResult = await isAdmin(userId);
	if (!adminResult.success) {
		return resultFail(adminResult.error);
	}

	try {
		const partner = await localPartnerRepository.findLocalPartnerForDeletion(localPartnerId);
		if (!partner) {
			return resultFail('Local partner not found.');
		}
		if (partner._count.recipients > 0) {
			return resultFail('Cannot delete local partner because recipients are still assigned.');
		}

		const deletePhone = partner.contact?.phoneId
			? await localPartnerRepository.findShouldDeletePhone(partner.contact.phoneId)
			: false;
		await localPartnerRepository.deleteLocalPartnerData({
			localPartnerId,
			contactId: partner.contactId,
			accountId: partner.accountId,
			addressId: partner.contact?.addressId ?? null,
			phoneId: partner.contact?.phoneId ?? null,
			deletePhone,
		});

		const firebaseResult = await deleteFirebaseUserByUidIfExists(partner.account.firebaseAuthUserId);
		if (!firebaseResult.success) {
			console.warn('Local partner deleted in DB but Firebase user deletion failed', {
				localPartnerId,
				error: firebaseResult.error,
			});
		}

		return resultOk({ id: localPartnerId });
	} catch (error) {
		console.error('Could not delete local partner', { localPartnerId, error });

		return resultFail('Could not delete local partner. Please try again later.');
	}
};

const getPublicLocalPartnerStatsByIds = async (
	localPartnerIds: string[],
): Promise<ServiceResult<PublicLocalPartnerStatsMap>> => {
	const normalizedIds = [...new Set(localPartnerIds.map((id) => id.trim()).filter(Boolean))];
	if (normalizedIds.length === 0) {
		return resultOk({});
	}

	try {
		const [partners, assignedGroups, waitingGroups] = await Promise.all([
			localPartnerRepository.findLocalPartnerIds(normalizedIds),
			localPartnerRepository.groupRecipientCountsByLocalPartner(normalizedIds, true),
			localPartnerRepository.groupRecipientCountsByLocalPartner(normalizedIds, false),
		]);
		const statsById: PublicLocalPartnerStatsMap = Object.fromEntries(
			partners.map(({ id }) => [id, { assignedRecipientsCount: 0, waitingRecipientsCount: 0 }]),
		);

		for (const group of assignedGroups) {
			const stats = statsById[group.localPartnerId];
			if (stats) {
				stats.assignedRecipientsCount = group._count._all;
			}
		}
		for (const group of waitingGroups) {
			const stats = statsById[group.localPartnerId];
			if (stats) {
				stats.waitingRecipientsCount = group._count._all;
			}
		}

		return resultOk(statsById);
	} catch (error) {
		console.error('Could not fetch local partner stats map', { error });

		return resultFail('Could not fetch local partner stats map');
	}
};

const validateCreateUniqueness = async (input: LocalPartnerCreateInput): Promise<ServiceResult<void>> => {
	if (await localPartnerRepository.findLocalPartnerByName(input.name)) {
		return resultFail('A local partner with this name already exists.');
	}
	if (await localPartnerRepository.findLocalPartnerBySlug(input.slug)) {
		return resultFail('A local partner with this slug already exists.');
	}
	if (await localPartnerRepository.findContactByEmail(input.contact.email)) {
		return resultFail('A contact with this email already exists.');
	}
	if (input.contact.phone && (await localPartnerRepository.findPhoneByNumber(input.contact.phone))) {
		return resultFail('A contact with this phone number already exists.');
	}

	return resultOk(undefined);
};

const validateUpdateUniqueness = async (
	input: LocalPartnerUpdateInput,
	existing: NonNullable<Awaited<ReturnType<typeof localPartnerRepository.findLocalPartnerForUpdate>>>,
): Promise<ServiceResult<void>> => {
	if (input.name !== existing.name) {
		const conflict = await localPartnerRepository.findLocalPartnerByName(input.name);
		if (conflict && conflict.id !== existing.id) {
			return resultFail('A local partner with this name already exists.');
		}
	}
	if (input.slug !== existing.slug) {
		const conflict = await localPartnerRepository.findLocalPartnerBySlug(input.slug);
		if (conflict && conflict.id !== existing.id) {
			return resultFail('A local partner with this slug already exists.');
		}
	}
	if (input.contact.email !== existing.contact.email) {
		const conflict = await localPartnerRepository.findContactByEmail(input.contact.email);
		if (conflict && conflict.id !== existing.contact.id) {
			return resultFail('A contact with this email already exists.');
		}
	}
	if (input.contact.phone && input.contact.phone !== existing.contact.phone?.number) {
		const conflict = await localPartnerRepository.findPhoneByNumber(input.contact.phone);
		if (conflict && conflict.id !== existing.contact.phone?.id) {
			return resultFail('A contact with this phone number already exists.');
		}
	}

	return resultOk(undefined);
};

const toLocalPartnerPayload = (partner: LocalPartnerRecord): LocalPartnerPayload => ({
	id: partner.id,
	name: partner.name,
	slug: partner.slug,
	focuses: partner.focuses.map(({ focusId }) => focusId),
	contact: partner.contact,
});
