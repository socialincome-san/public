'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { getServices } from '@/lib/services/services';
import type { CreateProgramInput } from '../services/program/program.types';

export const createProgramAction = async (input: CreateProgramInput) => {
const user = await getAuthenticatedUserOrThrow();
return getServices().programWrite.create(user.id, input);
};
