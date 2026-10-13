import { ProgramPermission } from '@/generated/prisma/enums';
import { resultFail, resultOk, type Result } from '@/lib/result';
import {
	assignRandomCandidatesToProgram,
	countUnassignedCandidates,
	listLocalPartnersWithUnassignedCandidates,
} from '@/modules/candidates/candidate.service';
import type { UnassignedCandidateFilter } from '@/modules/candidates/candidate.types';
import { getFocusOptions } from '@/modules/focuses/focus.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { calculateProgramBudget } from './program-stats.service';
import * as programRepository from './program.repository';
import type { ProgramRecipientPoolAssignInput, ProgramRecipientPoolPreviewInput } from './program.schemas';
import type { ProgramRecipientPoolPreview, ProgramRecipientPoolSetup } from './program.types';

export const getProgramRecipientPoolSetup = async (
	userId: string,
	programId: string,
): Promise<Result<ProgramRecipientPoolSetup>> => {
	const programResult = await requireOperatorProgram(userId, programId);
	if (!programResult.success) {
		return programResult;
	}

	const program = programResult.data;
	const [focusOptionsResult, localPartnerOptionsResult, totalCountResult] = await Promise.all([
		getFocusOptions(),
		listLocalPartnersWithUnassignedCandidates(program.country.isoCode),
		countUnassignedCandidates(emptyFilter(program.country.isoCode)),
	]);
	if (!focusOptionsResult.success) {
		return resultFail(focusOptionsResult.error);
	}
	if (!localPartnerOptionsResult.success) {
		return resultFail(localPartnerOptionsResult.error);
	}
	if (!totalCountResult.success) {
		return resultFail(totalCountResult.error);
	}

	const payoutPerInterval = Number(program.payoutPerInterval);
	if (!Number.isFinite(payoutPerInterval)) {
		console.error('Program payout amount is not a finite number', { programId });

		return resultFail('Could not load recipient pool');
	}

	return resultOk({
		programId: program.id,
		countryCode: program.country.isoCode,
		programDurationInMonths: program.programDurationInMonths,
		payoutPerInterval,
		payoutCurrency: program.country.currency,
		payoutInterval: program.payoutInterval,
		focusOptions: focusOptionsResult.data,
		localPartnerOptions: localPartnerOptionsResult.data,
		totalCount: totalCountResult.data.count,
	});
};

export const previewProgramRecipientPool = async (
	userId: string,
	input: ProgramRecipientPoolPreviewInput,
): Promise<Result<ProgramRecipientPoolPreview>> => {
	const programResult = await requireOperatorProgram(userId, input.programId);
	if (!programResult.success) {
		return programResult;
	}

	const program = programResult.data;
	const filter = candidateFilter(program.country.isoCode, input);
	const [totalCountResult, matchingCountResult] = await Promise.all([
		countUnassignedCandidates(emptyFilter(program.country.isoCode)),
		countUnassignedCandidates(filter),
	]);
	if (!totalCountResult.success) {
		return resultFail(totalCountResult.error);
	}
	if (!matchingCountResult.success) {
		return resultFail(matchingCountResult.error);
	}

	if (input.recipientCount === undefined || input.displayCurrency === undefined) {
		return resultOk({
			totalCount: totalCountResult.data.count,
			matchingCount: matchingCountResult.data.count,
			budget: null,
		});
	}

	const payoutPerInterval = Number(program.payoutPerInterval);
	if (!Number.isFinite(payoutPerInterval)) {
		console.error('Program payout amount is not a finite number', { programId: input.programId });

		return resultFail('Could not calculate recipient pool cost');
	}

	const budgetResult = await calculateProgramBudget({
		amountOfRecipients: input.recipientCount,
		programDuration: program.programDurationInMonths,
		defaultPayoutPerInterval: payoutPerInterval,
		payoutPerInterval,
		payoutInterval: program.payoutInterval,
		payoutCurrency: program.country.currency,
		displayCurrency: input.displayCurrency,
	});
	if (!budgetResult.success) {
		return resultFail(budgetResult.error);
	}

	return resultOk({
		totalCount: totalCountResult.data.count,
		matchingCount: matchingCountResult.data.count,
		budget: budgetResult.data,
	});
};

export const assignProgramRecipientsFromPool = async (
	userId: string,
	input: ProgramRecipientPoolAssignInput,
): Promise<Result<{ assigned: number }>> => {
	const programResult = await requireOperatorProgram(userId, input.programId);
	if (!programResult.success) {
		return programResult;
	}

	return assignRandomCandidatesToProgram(
		programResult.data.id,
		input.recipientCount,
		candidateFilter(programResult.data.country.isoCode, input),
	);
};

const requireOperatorProgram = async (userId: string, programId: string) => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return accessResult;
		}
		if (
			!accessResult.data.some((access) => access.programId === programId && access.permission === ProgramPermission.operator)
		) {
			return resultFail('Permission denied');
		}

		const program = await programRepository.findProgramRecipientPoolContext(programId);
		if (!program) {
			return resultFail('Program not found');
		}

		return resultOk(program);
	} catch (error) {
		console.error('Could not load program for recipient pool assignment', { userId, programId, error });

		return resultFail('Could not load recipient pool');
	}
};

const emptyFilter = (countryCode: UnassignedCandidateFilter['countryCode']): UnassignedCandidateFilter => ({
	countryCode,
	focusIds: [],
	profiles: [],
	localPartnerIds: [],
});

const candidateFilter = (
	countryCode: UnassignedCandidateFilter['countryCode'],
	input: { focusIds: string[]; profiles: UnassignedCandidateFilter['profiles']; localPartnerIds: string[] },
): UnassignedCandidateFilter => ({
	countryCode,
	focusIds: input.focusIds,
	profiles: input.profiles,
	localPartnerIds: input.localPartnerIds,
});
