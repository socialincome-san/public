import { getSessionAuditContext } from '@/lib/audit/audit-context';
import { resultFail, resultOk, type Result } from '@/lib/result';
import {
	assignRandomCandidatesToProgram,
	countUnassignedCandidates,
	listLocalPartnersWithUnassignedCandidates,
} from '@/modules/candidates/candidate.service';
import type { UnassignedCandidateFilter } from '@/modules/candidates/candidate.types';
import { getFocusOptions } from '@/modules/focuses/focus.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import type { UserSession } from '@/modules/users/user.types';
import { calculateProgramBudget } from './program-stats.service';
import { hasOperatorAccess } from './program.permissions';
import * as programRepository from './program.repository.read';
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

	return resultOk({
		programId: program.id,
		countryCode: program.country.isoCode,
		programDurationInMonths: program.programDurationInMonths,
		payoutPerInterval: program.payoutPerInterval,
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

	const budgetResult = await calculateProgramBudget({
		amountOfRecipients: input.recipientCount,
		programDuration: program.programDurationInMonths,
		defaultPayoutPerInterval: program.payoutPerInterval,
		payoutPerInterval: program.payoutPerInterval,
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
	session: UserSession,
	input: ProgramRecipientPoolAssignInput,
): Promise<Result<{ assigned: number }>> => {
	const programResult = await requireOperatorProgram(session.id, input.programId);
	if (!programResult.success) {
		return programResult;
	}

	return assignRandomCandidatesToProgram(
		{
			...getSessionAuditContext(session),
			metadata: { operation: 'recipient-pool-assignment', programId: programResult.data.id },
		},
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
		if (!hasOperatorAccess(accessResult.data, programId)) {
			return resultFail('Permission denied');
		}

		const program = await programRepository.findProgramRecipientPoolContext(programId);
		if (!program) {
			return resultFail('Program not found');
		}

		const payoutPerInterval = Number(program.payoutPerInterval);
		if (!Number.isFinite(payoutPerInterval)) {
			console.error('Program payout amount is not a finite number', { programId });

			return resultFail('Could not load recipient pool');
		}

		return resultOk({ ...program, payoutPerInterval });
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
