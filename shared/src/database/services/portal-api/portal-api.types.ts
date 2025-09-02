import { LocalPartner, Program, Recipient, User } from '@prisma/client';

export type RecipientExpanded = Recipient & {
	user: User | null;
	program: Program | null;
	localPartner: (LocalPartner & { user: User | null }) | null;
};

export type RecipientUserUpdateInput = {
	firstName?: string;
	lastName?: string;
	// TODO: add more fields here in the future
};
