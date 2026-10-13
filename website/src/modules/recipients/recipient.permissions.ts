import { ProgramPermission } from '@/generated/prisma/enums';
import type { Session } from '@/modules/auth/auth.types';
import type { ProgramAccess as AccessibleProgram } from '@/modules/program-access/program-access.types';

export const canCreateRecipient = (
	actor: RecipientActor,
	programId: string,
	accessiblePrograms: AccessibleProgram[],
	partnerHasRecipientInProgram = false,
): boolean => {
	if (actor.type === 'contributor') {
		return false;
	}

	if (actor.type === 'local-partner') {
		return partnerHasRecipientInProgram;
	}

	return hasOperatorAccess(accessiblePrograms, programId);
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

// Deleted recipients have no ownership left to check, so only admins may read
// their trail. Pool candidates (no program) are managed by admins as well.
export const canReadRecipientAuditTrail = (
	actor: RecipientActor,
	recipient: RecipientOwnership | null,
	accessiblePrograms: AccessibleProgram[],
	isAdminUser: boolean,
): boolean => {
	if (!recipient || (recipient.programId === null && actor.type === 'user')) {
		return actor.type === 'user' && isAdminUser;
	}

	return canReadRecipient(actor, recipient, accessiblePrograms);
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

type RecipientActor = Pick<Session, 'id' | 'type'>;

type RecipientOwnership = {
	programId: string | null;
	localPartnerId: string;
};
