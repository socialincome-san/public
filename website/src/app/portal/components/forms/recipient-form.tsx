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

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

type FieldType = 'input' | 'select' | 'date' | 'boolean' | 'number' | 'email';

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
	{ id: 'status', label: 'Status', type: 'select', options: statusOptions },
	// todo: add this as relation
	{ id: 'organizationId', label: 'Organization ID', type: 'input' },
	{ id: 'mobileMoneyPhone', label: 'Orange Money Phone Number', type: 'input' },
	{ id: 'mobileMoneyPhoneHasWhatsapp', label: 'Whatsapp (Orange Money Phone Number)', type: 'boolean' },
	{ id: 'callingName', label: 'Nickname', type: 'input' },
	{ id: 'communicationPhone', label: 'Communication Phone Number', type: 'input' },
	{ id: 'communicationPhoneHasWhatsapp', label: 'Whatsapp (Contact Phone)', type: 'boolean' },
	{ id: 'communicationPhoneWhatsappActivated', label: 'Whatsapp Activated', type: 'boolean' },
	{ id: 'gender', label: 'Gender', type: 'select', options: genderOptions },
	{ id: 'language', label: 'Preferred Language', type: 'select', options: languageOptions },
	{ id: 'profession', label: 'Profession', type: 'input' },
	{ id: 'email', label: 'Email', type: 'email' },
	{ id: 'instaHandle', label: 'Instagram', type: 'input' },
	{ id: 'twitterHandle', label: 'Twitter', type: 'input' },
	{ id: 'birthDate', label: 'Date of birth', type: 'date' },
];

const recipientZodSchema = z.object({
	omUid: z.number().optional(),
	firstName: z.string().min(2, 'Required'),
	lastName: z.string().min(2, 'Required'),
	status: z.nativeEnum(RecipientStatus).optional(),
	organizationId: z.string().optional(),
	mobileMoneyPhone: z.string().optional(),
	mobileMoneyPhoneHasWhatsapp: z.boolean().default(false),
	callingName: z.string().optional(),
	communicationPhone: z.string().optional(),
	communicationPhoneHasWhatsapp: z.boolean().default(false),
	communicationPhoneWhatsappActivated: z.boolean().default(false),
	gender: z.nativeEnum(Gender).optional(),
	language: z.nativeEnum(LanguageCode).optional(),
	profession: z.string().optional(),
	email: z.string().email().optional(),
	instaHandle: z.string().optional(),
	twitterHandle: z.string().optional(),
	birthDate: z.date().optional(),
});

type RecipientFormValues = z.infer<typeof recipientZodSchema>;

export function RecipientForm({ initialValues = {}, onSuccess, readOnly = false, onCancel }: RecipientFormProps) {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<RecipientFormValues>({
		resolver: zodResolver(recipientZodSchema),
		defaultValues: {
			...initialValues,
		},
	});

	const onSubmit = async (data: RecipientFormValues) => {
		if (readOnly) return;
		await createRecipientAction();
		onSuccess();
	};

	const formItemClasses = 'flex flex-col gap-2';

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			{recipientFormSchema.map((field) => {
				const zodField = recipientZodSchema.shape[field.id as keyof RecipientFormValues];
				const isRequired = !('isOptional' in zodField && zodField.isOptional());

				return (
					<div key={field.id} className={formItemClasses}>
						<Label htmlFor={field.id}>
							{field.label}
							{isRequired && <span> *</span>}
						</Label>

						{field.type === 'input' && (
							<Input
								id={field.id}
								disabled={readOnly}
								placeholder={field.placeholder}
								{...register(field.id as keyof RecipientFormValues)}
							/>
						)}

						{field.type === 'number' && (
							<Input
								id={field.id}
								type="number"
								disabled={readOnly}
								placeholder={field.placeholder}
								{...register(field.id as keyof RecipientFormValues, {
									setValueAs: (val) => {
										if (val === '' || val === null) return undefined;
										const numberVal = Number(val);
										return isNaN(numberVal) ? undefined : numberVal;
									},
								})}
							/>
						)}

						{field.type === 'email' && (
							<Input
								id={field.id}
								type="email"
								disabled={readOnly}
								placeholder={field.placeholder}
								{...register(field.id as keyof RecipientFormValues, {
									setValueAs: (val) => (val === '' ? undefined : val),
								})}
							/>
						)}

						{/* Select */}
						{field.type === 'select' && (
							<Controller
								name={field.id as keyof RecipientFormValues}
								control={control}
								render={({ field: rhfField }) => (
									<Select
										disabled={readOnly}
										value={rhfField.value ? String(rhfField.value) : undefined}
										onValueChange={rhfField.onChange}
									>
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
							/>
						)}

						{field.type === 'date' && (
							<Controller
								name={field.id as keyof RecipientFormValues}
								control={control}
								render={({ field: rhfField }) => (
									<DatePicker
										fieldId={field.id}
										readOnly={readOnly}
										value={rhfField.value as Date | undefined}
										onChange={rhfField.onChange}
									/>
								)}
							/>
						)}

						{field.type === 'boolean' && (
							<Controller
								name={field.id as keyof RecipientFormValues}
								control={control}
								render={({ field: rhfField }) => (
									<Switch
										id={field.id}
										disabled={readOnly}
										checked={!!rhfField.value}
										onCheckedChange={rhfField.onChange}
									/>
								)}
							/>
						)}

						{errors[field.id as keyof RecipientFormValues] && (
							<span className="text-sm text-red-500">
								{String(errors[field.id as keyof RecipientFormValues]?.message)}
							</span>
						)}
					</div>
				);
			})}

			<div>
				{readOnly && (
					<div className="mb-4 flex gap-4 text-red-700">
						<TriangleAlert className="h-6 w-6" />
						<span>No permission to edit</span>
					</div>
				)}
				<DialogFooter>
					<Button variant="outline" type="button" onClick={onCancel}>
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
