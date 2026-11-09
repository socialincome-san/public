'use client';

import type {
	Assignment,
	MessagingRecipientType,
	ParsedVariable,
	VariableAssignments,
} from '@/modules/messaging/messaging.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Input } from '@socialincome/design-system/forms/input/input';
import { RadioGroup, RadioGroupItem } from '@socialincome/design-system/forms/radio-group/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';
import { useTranslations } from 'next-intl';
import { getFieldCatalog, type FieldEntry } from './field-catalog';
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
	const t = useTranslations('portal-messaging');
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
						{t('wizard.actions.clear')}
					</Button>
				)}
			</div>

			<RadioGroup value={source} onValueChange={handleSourceChange} disabled={disabled} layout="row">
				<label className="flex items-center gap-2 text-sm">
					<RadioGroupItem value="field" />
					{t('wizard.assignments.field')}
				</label>
				<label className="flex items-center gap-2 text-sm">
					<RadioGroupItem value="constant" />
					{t('wizard.assignments.constant')}
				</label>
			</RadioGroup>

			{assignment?.source === 'field' && (
				<Select value={assignment.path} onValueChange={onSetField} disabled={disabled}>
					<SelectTrigger>
						<SelectValue placeholder={t('wizard.assignments.selectField')} />
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
					placeholder={t('wizard.assignments.constantPlaceholder')}
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
	const t = useTranslations('portal-messaging');

	if (variables.length === 0) {
		return <p className="text-muted-foreground text-sm">{t('wizard.assignments.noVariables')}</p>;
	}

	const disabled = type === null;
	const catalog = getFieldCatalog({
		firstName: t('wizard.fields.firstName'),
		lastName: t('wizard.fields.lastName'),
		callingName: t('wizard.fields.callingName'),
		email: t('wizard.fields.email'),
		gender: t('wizard.fields.gender'),
		language: t('wizard.fields.language'),
		dateOfBirth: t('wizard.fields.dateOfBirth'),
		profession: t('wizard.fields.profession'),
	});

	return (
		<div className="space-y-4">
			{body && (
				<div className="space-y-2">
					<h4 className="text-sm font-medium">{t('templates.summary.messageBody')}</h4>
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
