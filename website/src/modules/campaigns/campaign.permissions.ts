import { ProgramPermission } from '@/generated/prisma/enums';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';

export const canListCampaigns = (accessiblePrograms: ProgramAccesses): boolean =>
	accessiblePrograms.some((program) => program.permission === ProgramPermission.operator);

export const canReadEditableCampaigns = (accessiblePrograms: ProgramAccesses): boolean =>
	canListCampaigns(accessiblePrograms);
