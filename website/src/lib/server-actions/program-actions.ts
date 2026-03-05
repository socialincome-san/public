'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ProgramWriteService } from '../services/program/program-write.service';
import type { CreateProgramInput } from '../services/program/program.types';

const service = new ProgramWriteService();

export const createProgramAction = async (input: CreateProgramInput) => {
	const user = await getAuthenticatedUserOrThrow();

	return service.create(user.id, input);
};
