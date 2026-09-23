import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import * as programAccessRepository from './program-access.repository';
import type { CreateInitialProgramAccessesInput, ProgramAccesses } from './program-access.types';

export const getAccessiblePrograms = async (userId: string): Promise<ServiceResult<ProgramAccesses>> => {
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

export const createInitialAccessesForProgram = async (
	input: CreateInitialProgramAccessesInput,
): Promise<ServiceResult<void>> => {
	try {
		await programAccessRepository.createInitialProgramAccesses(input);

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not create initial program accesses', { programId: input.programId, error });

		return resultFail('Could not create program accesses');
	}
};
