'use client';

import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients.types';
import type { ParsedVariable, VariableAssignments } from '@/lib/services/twilio/messaging/twilio-messaging.types';
import { VariablesAssignmentSection } from '../variables-assignment-section';

type Props = {
	variables: ParsedVariable[];
	type: MessagingRecipientType | null;
	assignments: VariableAssignments;
	onChange: (next: VariableAssignments) => void;
};

export const Step3Assignments = ({ variables, type, assignments, onChange }: Props) => {
	return <VariablesAssignmentSection variables={variables} type={type} assignments={assignments} onChange={onChange} />;
};
