'use client';

import { Button } from '@/app/portal/components/button';
import { DatePicker } from '@/app/portal/components/date-picker';
import { DialogFooter } from '@/app/portal/components/dialog';
import { Input } from '@/app/portal/components/input';
import { Label } from '@/app/portal/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import { createRecipientAction } from '@/app/portal/server-actions/create-recipient-action';
import { Gender, RecipientStatus } from '@prisma/client';
import { TriangleAlert } from 'lucide-react';

type FieldType = 'input' | 'select' | 'date';

type FieldDefinition = {
	id: string;
	label: string;
	type: FieldType;
	placeholder?: string;
	options?: { value: string; label: string }[];
	date?: Date;
};

type InitialValues = Record<string, string | undefined>;

type RecipientFormProps = {
	initialValues?: InitialValues;
	readOnly?: boolean;
	onSuccess: () => void;
	onCancel: () => void;
};

const statusLabelMap: Record<keyof typeof RecipientStatus, string> = {
	active: 'Active',
	suspended: 'Suspended',
	waitlisted: 'Waitlisted',
	designated: 'Designated',
	former: 'Former',
};

const statusOptions = Object.entries(RecipientStatus).map(([key, value]) => ({
	value,
	label: statusLabelMap[key as keyof typeof RecipientStatus] ?? key,
}));

const genderLabelMap: Record<keyof typeof Gender, string> = {
	male: 'Male',
	female: 'Female',
	other: 'Other',
	private: 'Private',
};

const genderOptions = Object.entries(Gender).map(([key, value]) => ({
	value,
	label: genderLabelMap[key as keyof typeof Gender] ?? key,
}));

const recipientFormSchema: FieldDefinition[] = [
	{ id: 'firstName', label: 'First name', type: 'input', placeholder: 'Enter first name' },
	{ id: 'lastName', label: 'Last name', type: 'input', placeholder: 'Enter last name' },
	{ id: 'birthDate', label: 'Date of birth', type: 'date', placeholder: 'YYYY-MM-DD' },
	{ id: 'gender', label: 'Gender', type: 'select', placeholder: 'Enter gender', options: genderOptions },
	{ id: 'company', label: 'Company', type: 'input', placeholder: 'Enter company name' },
	{
		id: 'status',
		label: 'Status',
		type: 'select',
		placeholder: 'Choose status',
		options: statusOptions,
	},
];

export function RecipientForm({ initialValues = {}, onSuccess, readOnly = false, onCancel }: RecipientFormProps) {
	const formItemClasses = 'flex flex-col gap-2';

	const formAction = async () => {
		if (readOnly) return;
		await createRecipientAction();
		onSuccess();
	};

	return (
		<form action={formAction} className="flex flex-col gap-6">
			{recipientFormSchema.map((field) => (
				<div key={field.id} className={formItemClasses}>
					<Label htmlFor={field.id}>{field.label}</Label>

					{field.type === 'input' && (
						<Input
							id={field.id}
							name={field.id}
							defaultValue={initialValues[field.id]}
							placeholder={field.placeholder}
							disabled={readOnly}
						/>
					)}

					{field.type === 'select' && (
						<Select defaultValue={initialValues[field.id]} disabled={readOnly}>
							<SelectTrigger id={field.id}>
								<SelectValue placeholder={field.placeholder} />
							</SelectTrigger>
							<SelectContent>
								{field.options?.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}

					{field.type === 'date' && (
						<DatePicker
							initialDate={initialValues[field.id] ? new Date(initialValues[field.id] as string) : undefined}
							fieldId={field.id}
							readOnly={readOnly}
						/>
					)}
				</div>
			))}

			<div>
				{readOnly && (
					<div className="mb-4 flex gap-4 text-red-700">
						<TriangleAlert className="h-6 w-6" />
						<span>No permission to edit</span>
					</div>
				)}
				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="submit" disabled={readOnly}>
						Save recipient
					</Button>
				</DialogFooter>
			</div>
		</form>
	);
}
