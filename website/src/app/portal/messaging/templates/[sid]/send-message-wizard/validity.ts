import type { MessagingChannel } from '@/generated/prisma/client';
import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients/recipients.types';
import { getSelectedCount } from '@/lib/services/twilio/messaging/recipients/selection';
import type { SelectionState } from '@/lib/services/twilio/messaging/recipients/selection.types';
import type {
	ParsedVariable,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';
import { getAssignment } from './variable-assignments';

export type WizardStep = 1 | 2 | 3 | 4;

export const canAdvanceFromStep1 = (type: MessagingRecipientType | null, channel: MessagingChannel | null): boolean =>
	type !== null && channel !== null;

export const canAdvanceFromStep2 = (selection: SelectionState, totalCount: number): boolean =>
	getSelectedCount(selection, totalCount) > 0;

export const canAdvanceFromStep3 = (variables: ParsedVariable[], assignments: VariableAssignments): boolean =>
	variables.every((v) => {
		const a = getAssignment(assignments, v.key);
		if (a === null) {
			return false;
		}
		if (a.source === 'field') {
			return a.path !== '';
		}

		return a.value !== '';
	});

export type WizardState = {
	type: MessagingRecipientType | null;
	channel: MessagingChannel | null;
	selection: SelectionState;
	totalCount: number;
	variables: ParsedVariable[];
	assignments: VariableAssignments;
};

export const canAdvanceFromStep = (step: WizardStep, args: WizardState): boolean => {
	switch (step) {
		case 1:
			return canAdvanceFromStep1(args.type, args.channel);
		case 2:
			return canAdvanceFromStep2(args.selection, args.totalCount);
		case 3:
			return canAdvanceFromStep3(args.variables, args.assignments);
		case 4:
			return false;
	}
};
