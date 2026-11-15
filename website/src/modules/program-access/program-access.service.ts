import type { CountryCode } from '@/generated/prisma/enums';
import { resultFail, resultOk, type Result } from '@/lib/result';
import * as programAccessRepository from './program-access.repository';
import type { ProgramAccesses } from './program-access.types';

export const getAccessiblePrograms = async (userId: string): Promise<Result<ProgramAccesses>> => {
	try {
		const activeOrganizationId = await programAccessRepository.findActiveOrganizationId(userId);
		if (!activeOrganizationId) {
			return resultFail('User has no active organization');
		}

		const accesses = await programAccessRepository.findProgramAccessesByOrganizationId(activeOrganizationId);

		return resultOk(
			accesses.map(({ programId, permission, program }) => ({
				programId,
				programName: program.name,
				permission,
			})),
		);
	} catch (error) {
		console.error('Could not get accessible programs', { userId, error });

		return resultFail('Could not get accessible programs');
	}
};

export const getOperatorProgramCountriesForUser = async (userId: string): Promise<Result<CountryCode[]>> => {
	try {
		const accesses = await programAccessRepository.findOperatorProgramCountriesByUserId(userId);
		const countries = [...new Set(accesses.map(({ program }) => program.country.isoCode))].sort();

		return resultOk(countries);
	} catch (error) {
		console.error('Could not get operator program countries', { userId, error });

		return resultFail('Could not get operator program countries');
	}
};
