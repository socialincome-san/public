'use client';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients/recipients.types';
import { getFieldCatalog, type FieldEntry } from '@/lib/services/twilio/messaging/twilio-templates/field-catalog';
import type {
	Assignment,
	ParsedVariable,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';
import { clearAssignment, getAssignment, setConstantSource, setFieldSource } from './variable-assignments';

type VariableAssignmentRowProps = {
	variableKey: string;
	catalog: readonly FieldEntry[];
	assignment: Assignment | null;
	disabled: boolean;
	onSetField: (path: string) => void;
	onSetConstant: (value: string) => void;
	onClear: () => void;
};

const VariableAssignmentRow = ({
	variableKey,
	catalog,
	assignment,
	disabled,
	onSetField,
	onSetConstant,
	onClear,
}: VariableAssignmentRowProps) => {
	const source = assignment?.source ?? '';

	const handleSourceChange = (next: string) => {
		if (next === 'field') {
			onSetField(assignment?.source === 'field' ? assignment.path : '');
		} else if (next === 'constant') {
			onSetConstant(assignment?.source === 'constant' ? assignment.value : '');
		}
	};

	return (
		<div className="space-y-2 rounded-md border p-3">
			<div className="flex items-center justify-between">
				<span className="font-mono text-sm">{`{{${variableKey}}}`}</span>
				{assignment && (
					<Button variant="link" size="sm" onClick={onClear} disabled={disabled}>
						Clear
					</Button>
				)}
			</div>

			<RadioGroup value={source} onValueChange={handleSourceChange} disabled={disabled} className="flex gap-4">
				<label className="flex items-center gap-2 text-sm">
					<RadioGroupItem value="field" />
					Field
				</label>
				<label className="flex items-center gap-2 text-sm">
					<RadioGroupItem value="constant" />
					Constant
				</label>
			</RadioGroup>

			{assignment?.source === 'field' && (
				<Select value={assignment.path} onValueChange={onSetField} disabled={disabled}>
					<SelectTrigger>
						<SelectValue placeholder="Select field…" />
					</SelectTrigger>
					<SelectContent>
						{catalog.map((entry) => (
							<SelectItem key={entry.path} value={entry.path}>
								{entry.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			{assignment?.source === 'constant' && (
				<Input
					value={assignment.value}
					onChange={(e) => onSetConstant(e.target.value)}
					placeholder="Constant value"
					disabled={disabled}
				/>
			)}
		</div>
	);
};

type Props = {
	body: string | null;
	variables: ParsedVariable[];
	type: MessagingRecipientType | null;
	assignments: VariableAssignments;
	onChange: (next: VariableAssignments) => void;
};

export const Step3Assignments = ({ body, variables, type, assignments, onChange }: Props) => {
	if (variables.length === 0) {
		return <p className="text-muted-foreground text-sm">This template has no variables to personalize.</p>;
	}

	const disabled = type === null;
	const catalog = getFieldCatalog(type ?? 'contributor');

	return (
		<div className="space-y-4">
			{body && (
				<div className="space-y-2">
					<h4 className="text-sm font-medium">Message template</h4>
					<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{body}</pre>
				</div>
			)}
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
		</div>
	);
};
