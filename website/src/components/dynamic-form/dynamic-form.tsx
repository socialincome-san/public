/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@socialincome/design-system/data-display/accordion/accordion';
import { Combobox } from '@socialincome/design-system/forms/combo-box/combo-box';
import { DatePicker } from '@socialincome/design-system/forms/date-picker/date-picker';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@socialincome/design-system/forms/form/form';
import { Input } from '@socialincome/design-system/forms/input/input';
import { Label } from '@socialincome/design-system/forms/label/label';
import { MultiSelect } from '@socialincome/design-system/forms/multi-select/multi-select';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';
import { Switch } from '@socialincome/design-system/forms/switch/switch';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import z, { ZodObject, ZodTypeAny } from 'zod';
import { FormActions, type ExtraAction } from './form-actions';

type FormZodObject = ZodObject<Record<string, z.core.$ZodType>>;

export type FormField = {
	label: string;
	placeholder?: string;
	zodSchema?: ZodTypeAny;
	value?: any;
	useCombobox?: boolean;
	disabled?: boolean;
	options?: { id: string; label: string }[];
	onChange?: (value: any, form: UseFormReturn) => void;
};

export type FormSchema = {
	label: string;
	fields: Record<string, FormField | FormSchema>;
};

// recursively build Zod Schema from Form Schema
const buildZodSchema = (schemaDef: FormSchema): FormZodObject => {
	const result: Record<string, ZodTypeAny> = {};

	for (const key in schemaDef.fields) {
		const value = schemaDef.fields[key];

		if (isFormField(value) && value.zodSchema) {
			result[key] = value.zodSchema;
		} else {
			// nested object
			result[key] = buildZodSchema(value as FormSchema);
		}
	}

	return z.object(result);
};

// Typeguard
const isFormField = (obj: unknown): obj is FormField => {
	return obj !== null && typeof obj === 'object' && !('fields' in obj);
};

const unwrapOptional = (schema: z.core.$ZodType | undefined): z.core.$ZodType | undefined => {
	let current = schema;
	while (current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault) {
		current = current.unwrap();
	}

	return current;
};

// transforms and preprocessing are pipes in Zod 4, the schema being edited is the non-transform side
const unwrapPipe = (schema: z.core.$ZodType | undefined): z.core.$ZodType | undefined => {
	let current = unwrapOptional(schema);
	while (current instanceof z.ZodPipe) {
		current = unwrapOptional(current.in instanceof z.ZodTransform ? current.out : current.in);
	}

	return current;
};

// get first level or nested schema from Zod Schema
const getFieldSchema = (key: string, zodSchema: FormZodObject, parentKey?: string): z.core.$ZodType | undefined => {
	if (!parentKey) {
		return zodSchema.shape[key];
	}
	const parent = zodSchema.shape[parentKey];

	return parent instanceof z.ZodObject ? (parent.shape as Record<string, z.core.$ZodType>)[key] : undefined;
};

// get Zod Type by Form Schema key
const getType = (key: string, zodSchema: FormZodObject, parentKey?: string): string => {
	const schema = unwrapPipe(getFieldSchema(key, zodSchema, parentKey));
	if (schema instanceof z.ZodUnion) {
		return getTypeNameOf(unwrapPipe(schema.options[0]));
	}

	return getTypeNameOf(schema);
};

const getTypeNameOf = (schema: z.core.$ZodType | undefined): string => {
	if (schema instanceof z.ZodString) {
		return 'ZodString';
	}
	if (schema instanceof z.ZodNumber) {
		return 'ZodNumber';
	}
	if (schema instanceof z.ZodBoolean) {
		return 'ZodBoolean';
	}
	if (schema instanceof z.ZodDate) {
		return 'ZodDate';
	}
	if (schema instanceof z.ZodEnum) {
		return 'ZodEnum';
	}
	if (schema instanceof z.ZodArray) {
		return 'ZodArray';
	}
	if (schema instanceof z.ZodObject) {
		return 'ZodObject';
	}
	if (schema instanceof z.ZodUnion) {
		return 'ZodUnion';
	}

	return 'ZodUnknown';
};

const isOptional = (key: string, zodSchema: FormZodObject, parentOption?: string) => {
	let schema = getFieldSchema(key, zodSchema, parentOption);
	while (schema instanceof z.ZodDefault) {
		schema = schema.unwrap();
	}

	return schema instanceof z.ZodOptional || schema instanceof z.ZodNullable;
};

const toStringRecord = (values: Readonly<Record<string, string | number>>): Record<string, string> =>
	Object.fromEntries(Object.entries(values).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));

const getEnumArrayValues = (key: string, zodSchema: FormZodObject, parentOption?: string): Record<string, string> => {
	const schema = unwrapOptional(getFieldSchema(key, zodSchema, parentOption));
	if (!(schema instanceof z.ZodArray) || !(schema.element instanceof z.ZodEnum)) {
		return {};
	}

	return toStringRecord(schema.element.enum);
};

type Props = {
	formSchema: FormSchema;
	isLoading: boolean;
	onSubmit: (values: any) => void;
	onCancel?: () => void;
	onDelete?: () => void;
	extraAction?: ExtraAction;
	mode: 'add' | 'edit' | 'readonly';
};

const DynamicForm: FC<Props> = ({ formSchema, isLoading, onSubmit, onCancel, onDelete, extraAction, mode }) => {
	const zodSchema = buildZodSchema(formSchema);

	const form = useForm<z.infer<typeof zodSchema>>({
		resolver: zodResolver(zodSchema),
	});

	const getFormValuesFromSchema = (schema: FormSchema): Record<string, unknown> => {
		const values: Record<string, unknown> = {};

		for (const [name, field] of Object.entries(schema.fields)) {
			if (isFormField(field)) {
				values[name] = field.value;
				continue;
			}

			values[name] = getFormValuesFromSchema(field);
		}

		return values;
	};

	const getValuesIdentity = (values: Record<string, unknown>): string => {
		try {
			return JSON.stringify(values);
		} catch {
			return '';
		}
	};

	const lastResetIdentityRef = useRef<string>('');

	// reset form values on schema/entity changes to avoid stale values
	useEffect(() => {
		const values = mode === 'add' ? {} : getFormValuesFromSchema(formSchema);
		const nextIdentity = `${mode}:${getValuesIdentity(values)}`;
		if (lastResetIdentityRef.current === nextIdentity) {
			return;
		}

		lastResetIdentityRef.current = nextIdentity;
		form.reset(values);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form, formSchema, mode]);

	// get options from Zod Object
	const getOptions = (nestedKey?: string): string[] => {
		if (!nestedKey) {
			return zodSchema.keyof().options;
		}
		const nestedSchema = (zodSchema.shape as Record<string, z.ZodObject<Record<string, z.ZodTypeAny>>>)[nestedKey];

		return nestedSchema ? nestedSchema.keyof().options : [];
	};

	// TODO: move to recursive function
	// get values from Zod Schema and map back to form schema
	const beforeSubmit = (values: z.infer<typeof zodSchema>) => {
		const v = values;
		const schema = JSON.parse(JSON.stringify(formSchema)) as FormSchema;

		for (const key in schema.fields) {
			const fields = schema.fields[key];

			if (isFormField(fields)) {
				fields.value = v[key];
			} else {
				const nestedValues = v[key];
				for (const k in fields.fields) {
					const nestedField = fields.fields[k];
					if (isFormField(nestedField)) {
						nestedField.value =
							typeof nestedValues === 'object' && nestedValues !== null
								? (nestedValues as Record<string, unknown>)[k]
								: undefined;
					}
				}
			}
		}

		onSubmit(schema);
	};

	const [openAccordions, setOpenAccordions] = useState<string[]>([]);

	const onValidationErrors = (e: object) => {
		console.warn('dynamic form validation errors: ', e);
		const nestedOptions = getOptions().filter((option) => getType(option, zodSchema) === 'ZodObject');
		setOpenAccordions(nestedOptions.map((option) => `accordion-${option}`));
	};

	return (
		<Form {...form}>
			<form data-testid="dynamic-form" onSubmit={form.handleSubmit(beforeSubmit, onValidationErrors)} className="space-y-8">
				{getOptions().map((option) => {
					return getType(option, zodSchema) === 'ZodObject' ? (
						<Accordion
							key={option}
							type="multiple"
							value={openAccordions.includes(`accordion-${option}`) ? [`accordion-${option}`] : []}
							onValueChange={(value: string[]) =>
								setOpenAccordions((prev) =>
									value.includes(`accordion-${option}`)
										? Array.from(new Set([...prev, `accordion-${option}`]))
										: prev.filter((item) => item !== `accordion-${option}`),
								)
							}
						>
							<AccordionItem value={`accordion-${option}`} variant="boxed">
								<AccordionTrigger data-testid={`form-accordion-trigger-${option}`}>
									{formSchema.fields[option].label}
								</AccordionTrigger>
								<AccordionContent forceMount>
									<div className="flex flex-col gap-6 px-5 pt-5 pb-1">
										{getOptions(option).map((nestedOption) => (
											<GenericFormField
												option={nestedOption}
												zodSchema={zodSchema}
												form={form}
												formSchema={formSchema}
												isLoading={isLoading}
												parentOption={option}
												readOnly={mode === 'readonly'}
												key={nestedOption}
											/>
										))}
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					) : (
						<GenericFormField
							option={option}
							zodSchema={zodSchema}
							form={form}
							formSchema={formSchema}
							isLoading={isLoading}
							readOnly={mode === 'readonly'}
							key={option}
						/>
					);
				})}
				<FormActions mode={mode} isLoading={isLoading} onCancel={onCancel} onDelete={onDelete} extraAction={extraAction} />
			</form>
			{/* TODO: add proper loading state */}
			{isLoading && (
				<div className="bg-card absolute top-0 right-0 flex h-full w-full items-center justify-center opacity-80">
					<Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
				</div>
			)}
		</Form>
	);
};

const GenericFormField = ({
	option,
	zodSchema,
	form,
	formSchema,
	isLoading,
	parentOption,
	readOnly,
}: {
	option: string;
	zodSchema: FormZodObject;
	form: UseFormReturn;
	formSchema: FormSchema;
	isLoading: boolean;
	parentOption?: string;
	readOnly: boolean;
}) => {
	const optionKey = parentOption ? `${parentOption}.${option}` : option;

	const formFieldSchema = parentOption
		? (formSchema.fields[parentOption] as FormSchema)?.fields[option]
		: formSchema.fields[option];

	const getEnumValues = (key: string, parentOption?: string): Record<string, string> => {
		const schema = unwrapPipe(getFieldSchema(key, zodSchema, parentOption));

		return schema instanceof z.ZodEnum ? toStringRecord(schema.enum) : {};
	};

	const getDateMinMax = (key: string, parentOption?: string): { min?: Date; max?: Date } => {
		const schema = unwrapPipe(getFieldSchema(key, zodSchema, parentOption));
		if (!(schema instanceof z.ZodDate)) {
			return {};
		}

		return { min: schema.minDate ?? undefined, max: schema.maxDate ?? undefined };
	};

	const label = `${formFieldSchema.label} ${!isOptional(option, zodSchema, parentOption) ? '*' : ''}`;

	// set selected value if only one option available
	useEffect(() => {
		if (getType(option, zodSchema, parentOption) === 'ZodEnum') {
			const options = Object.entries(getEnumValues(option, parentOption));
			if (options.length === 1) {
				form.setValue(optionKey, options[0][1]);
			}
		}
	});

	if (isFormField(formFieldSchema)) {
		const emitChange = (value: any) => {
			formFieldSchema.onChange?.(value, form);
		};

		switch (getType(option, zodSchema, parentOption)) {
			case 'ZodArray': {
				const values = getEnumArrayValues(option, zodSchema, parentOption);

				const options =
					formFieldSchema.options?.map((o) => ({ value: o.id, label: o.label })) ??
					Object.entries(values).map(([value]) => ({
						value,
						label: value,
					}));

				return (
					<FormField
						control={form.control}
						name={optionKey}
						key={optionKey}
						render={({ field }) => (
							<FormItem>
								<Label>{label}</Label>
								<FormControl>
									<MultiSelect
										modalPopover
										options={options}
										defaultValue={field.value ?? []}
										onValueChange={(value) => {
											field.onChange(value);
											emitChange(value);
										}}
										placeholder={formFieldSchema.placeholder}
										disabled={Boolean(formFieldSchema.disabled) || Boolean(isLoading) || Boolean(readOnly)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				);
			}
			case 'ZodString':
				return (
					<FormField
						control={form.control}
						name={optionKey}
						key={optionKey}
						render={() => (
							<FormItem>
								<Label>{label}</Label>
								<FormControl>
									<Input
										placeholder={readOnly ? '-' : formFieldSchema.placeholder}
										{...form.register(optionKey)}
										disabled={Boolean(formFieldSchema.disabled) || Boolean(isLoading) || Boolean(readOnly)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				);
			case 'ZodDate':
				return (
					<FormField
						control={form.control}
						name={optionKey}
						key={optionKey}
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between gap-2">
									<Label>{label}</Label>
									{isOptional(option, zodSchema, parentOption) && !readOnly && field.value ? (
										<button
											type="button"
											data-testid="date-field-clear"
											className="text-muted-foreground hover:text-foreground text-sm"
											onClick={() => {
												field.onChange(undefined);
												emitChange(undefined);
											}}
										>
											Clear
										</button>
									) : null}
								</div>
								<FormControl>
									<DatePicker
										disabled={Boolean(formFieldSchema.disabled) || Boolean(isLoading) || Boolean(readOnly)}
										{...form.register(optionKey)}
										onSelect={(value) => {
											field.onChange(value);
											emitChange(value);
										}}
										selected={field.value}
										placeholder={readOnly ? '-' : formFieldSchema.placeholder}
										startMonth={getDateMinMax(option, parentOption).min}
										endMonth={getDateMinMax(option, parentOption).max}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				);
			case 'ZodEnum': {
				const enumValues = Object.entries(getEnumValues(option, parentOption));
				const items = formFieldSchema.options ?? enumValues.map(([label, value]) => ({ id: value, label }));

				if (formFieldSchema.useCombobox) {
					return (
						<FormField
							control={form.control}
							name={optionKey}
							key={optionKey}
							render={({ field }) => (
								<FormItem>
									<Label>{label}</Label>
									<FormControl>
										<Combobox
											options={items}
											value={field.value ?? ''}
											onChange={(value) => {
												field.onChange(value);
												emitChange(value);
											}}
											placeholder={formFieldSchema.placeholder}
											disabled={Boolean(formFieldSchema.disabled) || Boolean(isLoading) || Boolean(readOnly)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					);
				}

				return (
					<FormField
						control={form.control}
						name={optionKey}
						key={optionKey}
						render={({ field }) => (
							<FormItem>
								<Label>{label}</Label>
								<Select
									value={field.value}
									onValueChange={(value) => {
										field.onChange(value);
										emitChange(value);
									}}
									disabled={Boolean(formFieldSchema.disabled) || Boolean(isLoading) || Boolean(readOnly)}
								>
									<FormControl>
										<SelectTrigger aria-placeholder={formFieldSchema.placeholder}>
											<SelectValue placeholder={formFieldSchema.placeholder} />
										</SelectTrigger>
									</FormControl>
									<SelectContent {...form.register(optionKey)}>
										{items.map((item) => (
											<SelectItem value={item.id} key={item.id}>
												{item.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				);
			}
			case 'ZodBoolean':
				return (
					<FormField
						control={form.control}
						name={optionKey}
						key={optionKey}
						render={({ field }) => (
							<FormItem layout="inline">
								<Label htmlFor={optionKey}>{label}</Label>
								<Switch
									id={optionKey}
									disabled={Boolean(formFieldSchema.disabled) || Boolean(isLoading) || Boolean(readOnly)}
									onCheckedChange={(value) => {
										field.onChange(value);
										emitChange(value);
									}}
									checked={field.value}
								/>
								<FormMessage />
							</FormItem>
						)}
					/>
				);

			case 'ZodNumber':
				return (
					<FormField
						control={form.control}
						name={optionKey}
						key={optionKey}
						render={() => (
							<FormItem>
								<Label>{label}</Label>
								<FormControl>
									<Input
										type="number"
										step="any"
										placeholder={readOnly ? '-' : formFieldSchema.placeholder}
										{...form.register(optionKey, {
											setValueAs: (v) => {
												if (v === '' || v === null || v === undefined) {
													return undefined;
												}

												if (typeof v === 'number') {
													return Number.isNaN(v) ? undefined : v;
												}

												const parsed = Number(v);

												return Number.isNaN(parsed) ? undefined : parsed;
											},
										})}
										disabled={Boolean(formFieldSchema.disabled) || Boolean(isLoading) || Boolean(readOnly)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				);
			default:
				break;
		}
	}
};

export default DynamicForm;
