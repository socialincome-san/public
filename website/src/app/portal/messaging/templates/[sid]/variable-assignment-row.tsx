'use client';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import type { FieldEntry } from '@/lib/services/twilio/messaging/field-catalog';
import type { Assignment } from '@/lib/services/twilio/messaging/twilio-messaging.types';

type Props = {
	variableKey: string;
	catalog: readonly FieldEntry[];
	assignment: Assignment | null;
	disabled: boolean;
	onSetField: (path: string) => void;
	onSetConstant: (value: string) => void;
	onClear: () => void;
};

export const VariableAssignmentRow = ({
	variableKey,
	catalog,
	assignment,
	disabled,
	onSetField,
	onSetConstant,
	onClear,
}: Props) => {
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
