'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ProgramService } from '../services/program/program.service';
import type { CreateProgramInput } from '../services/program/program.types';

const service = new ProgramService();

export async function createProgramAction(input: CreateProgramInput) {
	const user = await getAuthenticatedUserOrThrow();

	return service.create(user.id, input);
}
