import type { CountryCode } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import {
	countCandidatesForLocalPartners,
	countRecipientsForProgramsAndLocalPartners,
} from '@/modules/recipients/recipient.service';
import { isAdmin } from '@/modules/users/user.service';
import * as focusRepository from './focus.repository';
import type { FocusCreateInput, FocusUpdateInput } from './focus.schemas';
import type {
	FocusOption,
	FocusPaginatedTableView,
	FocusPayload,
	FocusTableQuery,
	PublicFocusStatsBySlugMap,
} from './focus.types';

type FocusStatsSource = Awaited<ReturnType<typeof focusRepository.findFocusStatsBySlugs>>[number];
type PublicFocusStats = PublicFocusStatsBySlugMap[string];

export const getFocus = async (userId: string, focusId: string): Promise<ServiceResult<FocusPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const focus = await focusRepository.findFocusById(focusId);

		return focus ? resultOk(focus) : resultFail('Could not get focus');
	} catch (error) {
		console.error('Could not get focus', { focusId, error });

		return resultFail('Could not get focus');
	}
};

export const getPaginatedFocusTableView = async (
	userId: string,
	query: FocusTableQuery,
): Promise<ServiceResult<FocusPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { focuses, totalCount } = await focusRepository.findPaginatedFocuses(query);

		return resultOk({
			tableRows: focuses,
			totalCount,
		});
	} catch (error) {
		console.error('Could not fetch focuses', { userId, error });

		return resultFail('Could not fetch focuses');
	}
};

export const getFocusOptions = async (): Promise<ServiceResult<FocusOption[]>> => {
	try {
		return resultOk(await focusRepository.findFocusOptions());
	} catch (error) {
		console.error('Could not fetch focus options', { error });

		return resultFail('Could not fetch focus options');
	}
};

export const getPublicFocusStatsBySlugs = async (
	focusSlugs: string[],
): Promise<ServiceResult<PublicFocusStatsBySlugMap>> => {
	try {
		const normalizedFocusSlugs = [...new Set(focusSlugs.map((focusSlug) => focusSlug.trim()).filter(Boolean))];
		if (normalizedFocusSlugs.length === 0) {
			return resultOk({});
		}

		const focuses = await focusRepository.findFocusStatsBySlugs(normalizedFocusSlugs);
		const statsBySlug: PublicFocusStatsBySlugMap = {};
		const statsResults = await Promise.all(focuses.map(buildPublicFocusStats));
		for (const [index, statsResult] of statsResults.entries()) {
			if (!statsResult.success) {
				return resultFail(statsResult.error);
			}

			const focus = focuses[index];
			if (focus) {
				statsBySlug[focus.slug] = statsResult.data;
			}
		}

		return resultOk(statsBySlug);
	} catch (error) {
		console.error('Could not fetch focus stats by slug', { error });

		return resultFail('Could not fetch focus stats by slug');
	}
};

export const createFocus = async (userId: string, input: FocusCreateInput): Promise<ServiceResult<FocusPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const nameConflict = await focusRepository.findFocusByName(input.name);
		if (nameConflict) {
			return resultFail('A focus with this name already exists.');
		}
		const slugConflict = await focusRepository.findFocusBySlug(input.slug);
		if (slugConflict) {
			return resultFail('A focus with this slug already exists.');
		}

		return resultOk(await focusRepository.createFocus(input));
	} catch (error) {
		console.error('Could not create focus', { error });

		return resultFail('Could not create focus. Please try again later.');
	}
};

export const updateFocus = async (userId: string, input: FocusUpdateInput): Promise<ServiceResult<FocusPayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const existingFocus = await focusRepository.findFocusById(input.id);
		if (!existingFocus) {
			return resultFail('Focus not found');
		}
		if (input.name !== existingFocus.name) {
			const nameConflict = await focusRepository.findFocusByName(input.name);
			if (nameConflict && nameConflict.id !== input.id) {
				return resultFail('A focus with this name already exists.');
			}
		}
		if (input.slug !== existingFocus.slug) {
			const slugConflict = await focusRepository.findFocusBySlug(input.slug);
			if (slugConflict && slugConflict.id !== input.id) {
				return resultFail('A focus with this slug already exists.');
			}
		}

		return resultOk(await focusRepository.updateFocus(input));
	} catch (error) {
		console.error('Could not update focus', { focusId: input.id, error });

		return resultFail('Could not update focus. Please try again later.');
	}
};

export const deleteFocus = async (userId: string, focusId: string): Promise<ServiceResult<{ id: string }>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const focus = await focusRepository.findFocusForDeletion(focusId);
		if (!focus) {
			return resultFail('Focus not found');
		}
		if (focus._count.localPartners > 0 || focus._count.programs > 0) {
			return resultFail('Cannot delete focus because it is still in use');
		}

		await focusRepository.deleteFocus(focusId);

		return resultOk({ id: focusId });
	} catch (error) {
		console.error('Could not delete focus', { focusId, error });

		return resultFail('Could not delete focus');
	}
};

const buildPublicFocusStats = async (focus: FocusStatsSource): Promise<ServiceResult<PublicFocusStats>> => {
	const programIds = [...new Set(focus.programs.map(({ programId }) => programId))];
	const localPartnerIds = [...new Set(focus.localPartners.map(({ localPartnerId }) => localPartnerId))];
	const countryIsoCodes = [
		...new Set(
			focus.programs
				.map(({ program }) => program?.country.isoCode)
				.filter((countryIsoCode): countryIsoCode is CountryCode => countryIsoCode !== undefined),
		),
	];
	const hasLocalPartners = localPartnerIds.length > 0;
	const [recipientsInProgramsResult, candidatesResult] = await Promise.all([
		hasLocalPartners && programIds.length > 0
			? countRecipientsForProgramsAndLocalPartners(programIds, localPartnerIds)
			: Promise.resolve(resultOk(0)),
		hasLocalPartners ? countCandidatesForLocalPartners(localPartnerIds) : Promise.resolve(resultOk(0)),
	]);
	if (!recipientsInProgramsResult.success) {
		return resultFail(recipientsInProgramsResult.error);
	}
	if (!candidatesResult.success) {
		return resultFail(candidatesResult.error);
	}

	return resultOk({
		programsCount: focus._count.programs,
		recipientsInProgramsCount: recipientsInProgramsResult.data,
		candidatesCount: candidatesResult.data,
		countryIsoCodes,
	});
};
