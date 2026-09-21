import { ProgramPermission } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getCountryNameByCode } from '@/lib/types/country';
import { now } from '@/lib/utils/now';
import { slugify } from '@/lib/utils/string-utils';
import { assignRandomCandidatesToProgram } from '@/modules/candidates/candidate.service';
import { getCountryIsoCode } from '@/modules/countries/country.service';
import {
	createOrganizationFromEmail,
	getOperatorFallbackOrganizationId,
	getOrganizationReferenceOptions,
	validateOrganizationIds,
} from '@/modules/organizations/organization.service';
import { createInitialAccessesForProgram, getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { createPublicOnboardingUser, getActiveOrganizationId, isUserEmailAvailable } from '@/modules/users/user.service';
import { isReadyForFirstPayoutInterval } from './program-stats.service';
import * as programRepository from './program.repository';
import type { ProgramCreateInput, ProgramSettingsUpdateInput, PublicOnboardingUserDetailsInput } from './program.schemas';
import type {
	ProgramSettingsPayload,
	ProgramWallet,
	ProgramWallets,
	PublicPreviewProgram,
	PublicProgramDetails,
	PublicProgramFilterDataMap,
	PublicProgramStats,
	PublicProgramStatsMap,
	PublicProgramTargetFocus,
} from './program.types';

type PublicProgramRecord = NonNullable<Awaited<ReturnType<typeof programRepository.findPublicProgramBySlug>>>;
type PublicProgramStatsRecord = NonNullable<Awaited<ReturnType<typeof programRepository.findPublicProgramStatsById>>>;

export const getPublicProgramFilterDataByPortalSlugs = async (
	portalSlugs: string[],
): Promise<ServiceResult<PublicProgramFilterDataMap>> => {
	const normalizedSlugs = normalizeSlugs(portalSlugs);
	if (normalizedSlugs.length === 0) {
		return resultOk({});
	}

	try {
		const programs = await programRepository.findPublicProgramFilterDataBySlugs(normalizedSlugs);

		return resultOk(
			Object.fromEntries(
				programs.map((program) => [
					program.slug,
					{
						programId: program.id,
						countryIsoCode: program.country.isoCode,
						focuses: program.targetFocuses.map(({ focus }) => focus),
					},
				]),
			),
		);
	} catch (error) {
		console.error('Could not fetch program filter data', { error });

		return resultFail('Could not fetch program filter data');
	}
};

export const getPublicTargetFocusesByProgramId = async (
	programId: string,
): Promise<ServiceResult<PublicProgramTargetFocus[]>> => {
	const normalizedProgramId = programId.trim();
	if (!normalizedProgramId) {
		return resultFail('Missing program id');
	}

	try {
		const focuses = await programRepository.findPublicTargetFocusesByProgramId(normalizedProgramId);

		return resultOk(focuses.map(({ focus }) => focus));
	} catch (error) {
		console.error('Could not fetch program target focuses', { programId, error });

		return resultFail('Could not fetch program target focuses');
	}
};

export const getProgramWallets = async (userId: string): Promise<ServiceResult<ProgramWallets>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (accessResult.data.length === 0) {
			return resultOk({ wallets: [] });
		}

		const programs = await programRepository.findProgramWallets(accessResult.data.map(({ programId }) => programId));
		const wallets = await Promise.all(
			programs.map(async (program): Promise<ProgramWallet> => {
				const readinessResult = await isReadyForFirstPayoutInterval(program.id);

				return {
					id: program.id,
					programName: program.name,
					country: program.country.isoCode,
					payoutCurrency: program.country.currency,
					recipientsCount: program.recipients.length,
					totalPayoutsSum: sumPayoutAmounts(program.recipients),
					permission: accessResult.data.some(
						(access) => access.programId === program.id && access.permission === ProgramPermission.operator,
					)
						? ProgramPermission.operator
						: ProgramPermission.owner,
					isReadyForFirstPayouts: readinessResult.success ? readinessResult.data : false,
				};
			}),
		);

		return resultOk({ wallets });
	} catch (error) {
		console.error('Could not fetch program wallets', { userId, error });

		return resultFail('Could not fetch programs');
	}
};

export const getProgramWallet = async (userId: string, programId: string): Promise<ServiceResult<ProgramWallet>> => {
	const walletsResult = await getProgramWallets(userId);
	if (!walletsResult.success) {
		return resultFail(walletsResult.error);
	}
	const wallet = walletsResult.data.wallets.find(({ id }) => id === programId);

	return wallet ? resultOk(wallet) : resultFail('Program not found or not accessible');
};

export const getPublicProgramBySlug = async (slug: string): Promise<ServiceResult<PublicProgramDetails>> => {
	try {
		const program = await programRepository.findPublicProgramBySlug(slug);

		return program ? resultOk(toPublicProgramDetails(program)) : resultFail('Program not found');
	} catch (error) {
		console.error('Could not load public program', { slug, error });

		return resultFail('Could not load public program');
	}
};

export const getPublicPreviewProgramBySlug = async (slug: string): Promise<ServiceResult<PublicPreviewProgram>> => {
	try {
		const program = await programRepository.findPublicPreviewProgramBySlug(slug);

		return program ? resultOk(program) : resultFail('Program not found');
	} catch (error) {
		console.error('Could not load public preview program', { slug, error });

		return resultFail('Could not load public preview program');
	}
};

export const getPublicProgramStatsById = async (programId: string): Promise<ServiceResult<PublicProgramStats>> => {
	const normalizedProgramId = programId.trim();
	if (!normalizedProgramId) {
		return resultFail('Missing program id');
	}

	try {
		const program = await programRepository.findPublicProgramStatsById(normalizedProgramId);

		return program ? resultOk(toPublicProgramStats(program)) : resultFail('Program not found');
	} catch (error) {
		console.error('Could not fetch program stats', { programId, error });

		return resultFail('Could not fetch program stats');
	}
};

export const getPublicProgramStatsByProgramPortalSlugs = async (
	portalSlugs: string[],
): Promise<ServiceResult<PublicProgramStatsMap>> => {
	const normalizedSlugs = normalizeSlugs(portalSlugs);
	if (normalizedSlugs.length === 0) {
		return resultOk({});
	}

	try {
		const programs = await programRepository.findPublicProgramStatsBySlugs(normalizedSlugs);

		return resultOk(Object.fromEntries(programs.map((program) => [program.slug, toPublicProgramStats(program)])));
	} catch (error) {
		console.error('Could not fetch program stats map', { error });

		return resultFail('Could not fetch program stats map');
	}
};

export const getProgramIdByPortalSlug = async (slug: string): Promise<ServiceResult<string>> => {
	try {
		const program = await programRepository.findProgramIdBySlug(slug);

		return program ? resultOk(program.id) : resultFail('Program not found');
	} catch (error) {
		console.error('Could not resolve program id by slug', { slug, error });

		return resultFail('Could not resolve program id by slug');
	}
};

export const getProgramSlugById = async (programId: string): Promise<ServiceResult<string>> => {
	try {
		const program = await programRepository.findProgramSlugById(programId);

		return program ? resultOk(program.slug) : resultFail('Program not found');
	} catch (error) {
		console.error('Could not fetch program slug', { programId, error });

		return resultFail('Could not fetch program slug');
	}
};

export const getProgramSettings = async (
	userId: string,
	programId: string,
): Promise<ServiceResult<ProgramSettingsPayload>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		const accesses = accessResult.data.filter((access) => access.programId === programId);
		if (accesses.length === 0) {
			return resultFail('Permission denied');
		}
		const permission = accesses.some(({ permission }) => permission === ProgramPermission.operator)
			? ProgramPermission.operator
			: ProgramPermission.owner;
		const program = await programRepository.findProgramSettings(programId);
		if (!program) {
			return resultFail('Program not found');
		}

		return resultOk({
			id: program.id,
			name: program.name,
			slug: program.slug,
			countryId: program.countryId,
			country: program.country,
			amountOfRecipientsForStart: program.amountOfRecipientsForStart,
			coveredByReserves: program.coveredByReserves,
			programDurationInMonths: program.programDurationInMonths,
			payoutPerInterval: Number(program.payoutPerInterval),
			payoutInterval: program.payoutInterval,
			targetFocuses: program.targetFocuses.map(({ focusId }) => focusId),
			targetProfiles: program.targetProfiles,
			ownerOrganizationIds: program.programAccesses
				.filter(({ permission }) => permission === ProgramPermission.owner)
				.map(({ organizationId }) => organizationId),
			operatorOrganizationIds: program.programAccesses
				.filter(({ permission }) => permission === ProgramPermission.operator)
				.map(({ organizationId }) => organizationId),
			createdAt: program.createdAt,
			updatedAt: program.updatedAt,
			permission,
			canEdit: permission === ProgramPermission.operator,
		});
	} catch (error) {
		console.error('Could not load program settings', { userId, programId, error });

		return resultFail('Could not load program settings');
	}
};

export const getProgramOrganizationOptions = async (
	userId: string,
	programId: string,
): Promise<ServiceResult<{ id: string; name: string }[]>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		const programAccesses = accessResult.data.filter((access) => access.programId === programId);
		if (programAccesses.length === 0) {
			return resultFail('Permission denied');
		}
		if (programAccesses.some(({ permission }) => permission === ProgramPermission.operator)) {
			return getOrganizationReferenceOptions();
		}

		const organizations = await programRepository.findProgramOrganizationOptions(programId);

		return resultOk(organizations.map(({ organization }) => organization));
	} catch (error) {
		console.error('Could not load program organization options', { userId, programId, error });

		return resultFail('Could not load organization options');
	}
};

export const createProgram = async (
	input: ProgramCreateInput,
	actor: { userId: string } | PublicOnboardingUserDetailsInput,
): Promise<ServiceResult<{ programId: string }>> => {
	try {
		let userId: string;
		if ('userId' in actor) {
			userId = actor.userId;
		} else {
			const emailAvailableResult = await isUserEmailAvailable(actor.email);
			if (!emailAvailableResult.success) {
				return resultFail(emailAvailableResult.error);
			}
			if (!emailAvailableResult.data) {
				return resultFail('An account with this email already exists. Please log in instead.');
			}
			const organizationResult = await createOrganizationFromEmail(actor.email);
			if (!organizationResult.success) {
				return resultFail(organizationResult.error);
			}
			const userResult = await createPublicOnboardingUser({
				...actor,
				organizationId: organizationResult.data.id,
			});
			if (!userResult.success) {
				return resultFail(userResult.error);
			}
			userId = userResult.data.userId;
		}

		const [activeOrganizationResult, operatorOrganizationResult, countryResult] = await Promise.all([
			getActiveOrganizationId(userId),
			getOperatorFallbackOrganizationId(),
			getCountryIsoCode(input.countryId),
		]);
		if (!activeOrganizationResult.success) {
			return resultFail(activeOrganizationResult.error);
		}
		if (!operatorOrganizationResult.success) {
			return resultFail(operatorOrganizationResult.error);
		}
		if (!countryResult.success) {
			return resultFail(countryResult.error);
		}

		const programName = `${getCountryNameByCode(countryResult.data)} Program ${Math.floor(10000 + Math.random() * 90000)}`;
		const program = await programRepository.createProgram(input, programName, slugify(programName));
		const campaignEndDate = now();
		campaignEndDate.setFullYear(campaignEndDate.getFullYear() + 10);
		await programRepository.createDefaultCampaign(program.id, campaignEndDate);
		const accessResult = await createInitialAccessesForProgram({
			programId: program.id,
			ownerOrganizationId: activeOrganizationResult.data,
			operatorFallbackOrganizationId: operatorOrganizationResult.data,
		});
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (input.amountOfRecipientsForStart > 0) {
			const assignmentResult = await assignRandomCandidatesToProgram(
				program.id,
				input.amountOfRecipientsForStart,
				countryResult.data,
				input.targetFocuses,
				input.targetProfiles,
			);
			if (!assignmentResult.success) {
				return resultFail(assignmentResult.error);
			}
		}

		return resultOk({ programId: program.id });
	} catch (error) {
		console.error('Could not create program', { error });

		return resultFail('Could not create program');
	}
};

export const updateProgramSettings = async (
	userId: string,
	input: ProgramSettingsUpdateInput,
): Promise<ServiceResult<{ id: string }>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (
			!accessResult.data.some((access) => access.programId === input.id && access.permission === ProgramPermission.operator)
		) {
			return resultFail('Permission denied');
		}

		const normalizedSlug = slugify(input.slug);
		const [nameConflict, slugConflict, existingProgram, countryResult] = await Promise.all([
			programRepository.findProgramByName(input.name),
			programRepository.findProgramBySlug(normalizedSlug),
			programRepository.findProgramSettings(input.id),
			getCountryIsoCode(input.countryId),
		]);
		if (nameConflict && nameConflict.id !== input.id) {
			return resultFail('A program with this name already exists.');
		}
		if (slugConflict && slugConflict.id !== input.id) {
			return resultFail('A program with this slug already exists.');
		}
		if (!existingProgram) {
			return resultFail('Program not found');
		}
		if (!countryResult.success) {
			return resultFail(countryResult.error);
		}

		const organizationIds = [...new Set([...input.ownerOrganizationIds, ...input.operatorOrganizationIds])];
		const organizationsResult = await validateOrganizationIds(organizationIds);
		if (!organizationsResult.success) {
			return resultFail(organizationsResult.error);
		}
		if (!organizationsResult.data) {
			return resultFail('One or more selected organizations do not exist.');
		}

		await programRepository.updateProgramSettings(input, normalizedSlug);

		return resultOk({ id: input.id });
	} catch (error) {
		console.error('Could not update program settings', { programId: input.id, error });

		return resultFail('Could not update program settings');
	}
};

export const deleteProgram = async (userId: string, programId: string): Promise<ServiceResult<void>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (
			!accessResult.data.some((access) => access.programId === programId && access.permission === ProgramPermission.operator)
		) {
			return resultFail('Permission denied');
		}
		if (!(await programRepository.findProgramNameById(programId))) {
			return resultFail('Program not found');
		}

		const blockers = await programRepository.findProgramDeletionBlockers(programId);
		if (blockers.hasPayouts) {
			return resultFail('Program cannot be deleted because recipients already have payouts.');
		}
		if (blockers.hasContributions) {
			return resultFail('Program cannot be deleted because related campaigns already have contributions.');
		}

		await programRepository.deleteProgram(programId);

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not delete program', { programId, error });

		return resultFail('Could not delete program');
	}
};

const normalizeSlugs = (slugs: string[]): string[] => [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];

const sumPayoutAmounts = (recipients: { payouts: { amount: unknown }[] }[]): number =>
	recipients.reduce(
		(recipientTotal, recipient) =>
			recipientTotal + recipient.payouts.reduce((payoutTotal, payout) => payoutTotal + Number(payout.amount ?? 0), 0),
		0,
	);

const sumPayoutAmountsChf = (recipients: { payouts: { amountChf: unknown }[] }[]): number =>
	recipients.reduce(
		(recipientTotal, recipient) =>
			recipientTotal + recipient.payouts.reduce((payoutTotal, payout) => payoutTotal + Number(payout.amountChf ?? 0), 0),
		0,
	);

const toPublicProgramStats = (program: PublicProgramStatsRecord): PublicProgramStats => ({
	campaignsCount: program._count.campaigns,
	recipientsCount: program._count.recipients,
	countryIsoCode: program.country.isoCode,
	payoutCurrency: program.country.currency,
	totalPayoutsSum: sumPayoutAmounts(program.recipients),
	totalPayoutsSumChf: sumPayoutAmountsChf(program.recipients),
});

const toPublicProgramDetails = (program: PublicProgramRecord): PublicProgramDetails => {
	const ownerAccess = program.programAccesses.find(({ permission }) => permission === ProgramPermission.owner);
	const operatorAccess = program.programAccesses.find(({ permission }) => permission === ProgramPermission.operator);
	let totalPayoutsSum = 0;
	let totalPayoutsCount = 0;
	let completedSurveysCount = 0;
	let earliestStart: Date | null = null;
	const localPartnerCounts = new Map<string, { name: string; slug: string; count: number }>();

	for (const recipient of program.recipients) {
		if (recipient.startDate && (!earliestStart || recipient.startDate < earliestStart)) {
			earliestStart = recipient.startDate;
		}
		totalPayoutsSum += sumPayoutAmounts([recipient]);
		totalPayoutsCount += recipient.payouts.length;
		completedSurveysCount += recipient.surveys.length;
		if (recipient.localPartner) {
			const currentCount = localPartnerCounts.get(recipient.localPartner.slug)?.count ?? 0;
			localPartnerCounts.set(recipient.localPartner.slug, {
				...recipient.localPartner,
				count: currentCount + 1,
			});
		}
	}

	const topLocalPartner = [...localPartnerCounts.values()].sort((left, right) => right.count - left.count)[0];

	return {
		programId: program.id,
		programName: program.name,
		countryIsoCode: program.country.isoCode,
		ownerOrganizationName: ownerAccess?.organization.name ?? null,
		localPartnerName: topLocalPartner?.name ?? null,
		localPartnerSlug: topLocalPartner?.slug ?? null,
		operatorOrganizationName: operatorAccess?.organization.name ?? null,
		targetFocuses: program.targetFocuses.map(({ focusId }) => focusId),
		amountOfRecipientsForStart: program.amountOfRecipientsForStart,
		programDurationInMonths: program.programDurationInMonths,
		payoutPerInterval: Number(program.payoutPerInterval),
		payoutCurrency: program.country.currency,
		payoutInterval: program.payoutInterval,
		recipientsCount: program.recipients.length,
		totalPayoutsCount,
		totalPayoutsSum,
		completedSurveysCount,
		startedAt: earliestStart,
	};
};
