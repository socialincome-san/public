import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import * as programRepository from './program.repository';
import type { ProgramOption, ProgramPayoutForecastSource } from './program.types';

export const getProgramNameById = async (programId: string): Promise<ServiceResult<string>> => {
	try {
		const program = await programRepository.findProgramNameById(programId);

		return program ? resultOk(program.name) : resultFail('Program not found');
	} catch (error) {
		console.error('Could not fetch program name', { programId, error });

		return resultFail('Could not fetch program name');
	}
};

export const getProgramReferenceOptions = async (): Promise<ServiceResult<ProgramOption[]>> => {
	try {
		return resultOk(await programRepository.findProgramOptions());
	} catch (error) {
		console.error('Could not fetch program reference options', { error });

		return resultFail('Could not fetch programs');
	}
};

export const validateProgramIds = async (programIds: string[]): Promise<ServiceResult<boolean>> => {
	try {
		const uniqueIds = [...new Set(programIds)];
		const programs = await programRepository.findProgramsByIds(uniqueIds);

		return resultOk(programs.length === uniqueIds.length);
	} catch (error) {
		console.error('Could not validate programs', { error });

		return resultFail('Could not validate programs');
	}
};

export const countProgramsCreatedBetween = async (from: Date, to: Date): Promise<ServiceResult<number>> => {
	try {
		return resultOk(await programRepository.countProgramsCreatedBetween(from, to));
	} catch (error) {
		console.error('Could not count newly created programs', { error });

		return resultFail('Could not count newly created programs');
	}
};

export const getProgramPayoutForecastSource = async (
	programId: string,
): Promise<ServiceResult<ProgramPayoutForecastSource>> => {
	try {
		const program = await programRepository.findProgramPayoutForecastSource(programId);
		if (!program) {
			return resultFail('Program not found');
		}

		return resultOk({
			programDurationInMonths: program.programDurationInMonths,
			payoutPerInterval: Number(program.payoutPerInterval),
			payoutInterval: program.payoutInterval,
			country: program.country,
			recipients: program.recipients,
		});
	} catch (error) {
		console.error('Could not fetch program payout forecast source', { programId, error });

		return resultFail('Could not fetch program payout forecast source');
	}
};
