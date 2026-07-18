'use client';

import { getFieldCatalog } from '@/lib/services/twilio/messaging/field-catalog';
import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients.types';
import type { ParsedVariable, VariableAssignments } from '@/lib/services/twilio/messaging/twilio-messaging.types';
import { VariableAssignmentRow } from './variable-assignment-row';
import { clearAssignment, getAssignment, setConstantSource, setFieldSource } from './variable-assignments';

type Props = {
	variables: ParsedVariable[];
	type: MessagingRecipientType | null;
	assignments: VariableAssignments;
	onChange: (next: VariableAssignments) => void;
};

export const VariablesAssignmentSection = ({ variables, type, assignments, onChange }: Props) => {
	if (variables.length === 0) {
		return (
			<section className="space-y-2">
				<h3 className="text-sm font-medium">Variables</h3>
				<p className="text-muted-foreground text-sm">No variables in this template.</p>
			</section>
		);
	}

	const disabled = type === null;
	const catalog = getFieldCatalog(type ?? 'contributor');

	return (
		<section className="space-y-3">
			<h3 className="text-sm font-medium">Variables</h3>
			{disabled && <p className="text-muted-foreground text-sm">Pick a recipient type above to assign variables.</p>}
			<div className="space-y-2">
				{variables.map((variable) => (
					<VariableAssignmentRow
						key={variable.key}
						variableKey={variable.key}
						catalog={catalog}
						assignment={getAssignment(assignments, variable.key)}
						disabled={disabled}
						onSetField={(path) => onChange(setFieldSource(assignments, variable.key, path))}
						onSetConstant={(value) => onChange(setConstantSource(assignments, variable.key, value))}
						onClear={() => onChange(clearAssignment(assignments, variable.key))}
					/>
				))}
			</div>
		</section>
	);
};
