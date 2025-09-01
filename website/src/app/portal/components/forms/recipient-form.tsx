'use client';

import { Button } from '@/app/portal/components/button';
import { DatePicker } from '@/app/portal/components/date-picker';
import { DialogFooter } from '@/app/portal/components/dialog';
import { Input } from '@/app/portal/components/input';
import { Label } from '@/app/portal/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import { createRecipientAction } from '@/app/portal/server-actions/create-recipient-action';
import { Gender, LanguageCode, RecipientStatus } from '@prisma/client';
import { Switch } from '@socialincome/ui/src/components/switch';
import { TriangleAlert } from 'lucide-react';

type FieldType = 'input' | 'select' | 'date' | 'boolean' | 'number';

type FieldDefinition = {
	id: string;
	label: string;
	type: FieldType;
	placeholder?: string;
	options?: { value: string; label: string }[];
};

type InitialValues = Record<string, string | boolean | Date | number | undefined> | null; //todo remove undefined

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

const languageLabelMap: Record<keyof typeof LanguageCode, string> = {
	en: 'English',
	fr: 'French',
	de: 'German',
	it: 'Italian',
	kri: 'Kriol',
};

const languageOptions = Object.entries(LanguageCode).map(([key, value]) => ({
	value,
	label: languageLabelMap[key as keyof typeof LanguageCode] ?? key,
}));

const recipientFormSchema: FieldDefinition[] = [
	{ id: 'omUid', label: 'OM ID', type: 'number' },
	{ id: 'firstName', label: 'First name', type: 'input' },
	{ id: 'lastName', label: 'Last name', type: 'input' },
	{
		id: 'status',
		label: 'Status',
		type: 'select',
		options: statusOptions,
	},
	// todo: add this as relation
	{ id: 'organizationId', label: 'Organization ID', type: 'input' },
	{
		id: 'mobileMoneyPhone',
		label: 'Orange Money Phone Number',
		type: 'input',
	},
	{
		id: 'mobileMoneyPhoneHasWhatsapp',
		label: 'Whatsapp (Orange Money Phone Number)',
		type: 'boolean',
	},
	{ id: 'callingName', label: 'Nickname', type: 'input' },
	{
		id: 'communicationPhone',
		label: 'Communication Phone Number',
		type: 'input',
	},
	{
		id: 'communicationPhoneHasWhatsapp',
		label: 'Whatsapp (Contact Phone)',
		type: 'boolean',
	},
	{
		id: 'communicationPhoneWhatsappActivated',
		label: 'Whatsapp Activated',
		type: 'boolean',
	},
	{ id: 'gender', label: 'Gender', type: 'select', options: genderOptions },
	// todo: add type for LanguageCode
	{ id: 'language', label: 'Preferred Language', type: 'select', options: languageOptions },
	{ id: 'profession', label: 'Profession', type: 'input' },
	{ id: 'email', label: 'Email', type: 'input' },
	{ id: 'instaHandle', label: 'Instagram', type: 'input' },
	{ id: 'twitterHandle', label: 'Twitter', type: 'input' },
	{ id: 'birthDate', label: 'Date of birth', type: 'date' },
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
							defaultValue={initialValues?.[field.id] != null ? (initialValues?.[field.id] as string) : ''}
							placeholder={field.placeholder}
							disabled={readOnly}
						/>
					)}

					{field.type === 'number' && (
						<Input
							id={field.id}
							name={field.id}
							defaultValue={initialValues?.[field.id] as string}
							placeholder={field.placeholder}
							disabled={readOnly}
							type="number"
						/>
					)}

					{field.type === 'select' && (
						<Select defaultValue={initialValues?.[field.id] as string} disabled={readOnly}>
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
							initialDate={initialValues?.[field.id] instanceof Date ? (initialValues?.[field.id] as Date) : undefined}
							fieldId={field.id}
							readOnly={readOnly}
						/>
					)}
					{field.type === 'boolean' && (
						<Switch
							id={field.id}
							name={field.id}
							disabled={readOnly}
							defaultChecked={Boolean(initialValues?.[field.id])}
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
