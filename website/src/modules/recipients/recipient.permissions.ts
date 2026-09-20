import { ProgramPermission } from '@/generated/prisma/enums';
import type { Session } from '@/lib/firebase/current-account';

export const canCreateRecipient = (
	actor: RecipientActor,
	programId: string,
	accessiblePrograms: AccessibleProgram[],
): boolean => {
	if (actor.type === 'contributor') {
		return false;
	}

	return actor.type === 'local-partner' || hasOperatorAccess(accessiblePrograms, programId);
};

export const canReadRecipient = (
	actor: RecipientActor,
	recipient: RecipientOwnership,
	accessiblePrograms: AccessibleProgram[],
): boolean => {
	if (actor.type === 'contributor') {
		return false;
	}

	if (actor.type === 'local-partner') {
		return recipient.localPartnerId === actor.id;
	}

	return recipient.programId !== null && hasOperatorAccess(accessiblePrograms, recipient.programId);
};

export const canUpdateRecipient = (
	actor: RecipientActor,
	recipient: RecipientOwnership,
	requestedProgramId: string | undefined,
	accessiblePrograms: AccessibleProgram[],
): boolean => {
	if (!canReadRecipient(actor, recipient, accessiblePrograms)) {
		return false;
	}

	return (
		actor.type === 'local-partner' ||
		requestedProgramId === undefined ||
		hasOperatorAccess(accessiblePrograms, requestedProgramId)
	);
};

export const canRemoveRecipientFromProgram = (
	actor: RecipientActor,
	programId: string,
	accessiblePrograms: AccessibleProgram[],
): boolean => {
	return actor.type === 'user' && hasOperatorAccess(accessiblePrograms, programId);
};

export const canExportRecipients = (actor: RecipientActor): boolean => actor.type !== 'contributor';

export const hasOperatorAccess = (accessiblePrograms: AccessibleProgram[], programId: string): boolean => {
	return accessiblePrograms.some(
		(program) => program.programId === programId && program.permission === ProgramPermission.operator,
	);
};

type AccessibleProgram = {
	programId: string;
	programName: string;
	permission: ProgramPermission;
};

type RecipientActor = Pick<Session, 'id' | 'type'>;

type RecipientOwnership = {
	programId: string | null;
	localPartnerId: string;
};
