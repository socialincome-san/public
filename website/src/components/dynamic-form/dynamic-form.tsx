/* eslint-disable @typescript-eslint/no-explicit-any */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/accordion';
import { Combobox } from '@/components/combo-box';
import { DatePicker } from '@/components/date-picker';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Switch } from '@/components/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpinnerIcon } from '@socialincome/ui';
import { FC, useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import z, { ZodObject, ZodTypeAny } from 'zod';
import { MultiSelect } from '../multi-select';
import { FormActions } from './form-actions';

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
const buildZodSchema = (schemaDef: FormSchema): ZodObject<any> => {
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

// get first level or nested def object from Zod Schema
const getDef = (
	key: string,
	zodSchema: z.ZodObject<any>,
	parentKey?: string,
) => {
	const zodShape = zodSchema.shape as Record<string, { _def?: unknown }>;
	if (!parentKey) {
		return zodShape[String(key)]?._def;
	}
	const nestedShapeFactory = (zodShape[parentKey]?._def as { shape?: unknown })?.shape as
		| (() => Record<string, { _def?: unknown }>)
		| undefined;
	const nestedShape = nestedShapeFactory ? nestedShapeFactory() : undefined;
	return nestedShape?.[String(key)]?._def;
};

const getTypeName = (def: unknown): string | undefined => {
	if (!def || typeof def !== 'object') {
		return undefined;
	}
	const maybeTypeName = (def as { typeName?: unknown }).typeName;
	return typeof maybeTypeName === 'string' ? maybeTypeName : undefined;
};

// get Zod Type by Form Schema key
const getType = (
	key: string,
	zodSchema: z.ZodObject<any>,
	parentKey?: string,
): string => {
	const def = getDef(key, zodSchema, parentKey);
	let type = getTypeName(def) ?? 'ZodUnknown';
	if (isOptional(key, zodSchema, parentKey)) {
		const optionalType = getTypeName((def as { innerType?: { _def?: unknown } }).innerType?._def);
		if (optionalType) {
			type = optionalType;
		}
	}
	if (type === 'ZodEffects') {
		return getTypeName((def as { innerType?: { _def?: { schema?: { _def?: unknown } } } }).innerType?._def?.schema?._def) ?? type;
	}
	if (type === 'ZodUnion') {
		const unionOptionType = getTypeName(
			(def as { innerType?: { _def?: { options?: { _def?: unknown }[] } } }).innerType?._def?.options?.[0]?._def,
		);
		return unionOptionType ?? type;
	}
	if (type === 'ZodNativeEnum') {
		return 'ZodEnum';
	}
	return type;
};

const isOptional = (
	key: string,
	zodSchema: z.ZodObject<any>,
	parentOption?: string,
) => {
	const def = getDef(key, zodSchema, parentOption);
	const type = (def as { typeName?: string })?.typeName;
	if (typeof type !== 'string') {
		return false;
	}
	return ['ZodOptional', 'ZodNullable'].includes(type);
};

const unwrapOptional = (def: unknown) => {
	const type = getTypeName(def);
	if (type === 'ZodOptional' || type === 'ZodNullable') {
		return (def as { innerType?: { _def?: unknown } }).innerType?._def;
	}
	return def;
};

const getEnumArrayValues = (
	key: string,
	zodSchema: z.ZodObject<any>,
	parentOption?: string,
): Record<string, string> => {
	let def: unknown = getDef(key, zodSchema, parentOption);
	def = unwrapOptional(def);

	if (getTypeName(def) !== 'ZodArray') {
		return {};
	}

	return (def as { type?: { _def?: { values?: Record<string, string> } } }).type?._def?.values ?? {};
};

type Props = {
	formSchema: FormSchema;
	isLoading: boolean;
	onSubmit: (values: any) => void;
	onCancel?: () => void;
	onDelete?: () => void;
	mode: 'add' | 'edit' | 'readonly';
};

const DynamicForm: FC<Props> = ({ formSchema, isLoading, onSubmit, onCancel, onDelete, mode }) => {
	const zodSchema = buildZodSchema(formSchema);

	const form = useForm<z.infer<typeof zodSchema>>({
		resolver: zodResolver(zodSchema),
	});

	// set form values if available
	useEffect(() => {
		if (mode !== 'add') {
			for (const [name, field] of Object.entries(formSchema.fields)) {
				if (!isFormField(field)) {
					//nested
					for (const [nestedName, nestedField] of Object.entries(field.fields)) {
						if (isFormField(nestedField) && nestedField.value !== null && nestedField.value !== undefined) {
							form.setValue(`${name}.${nestedName}` as any, nestedField.value);
						}
					}
				} else if (field.value !== null && field.value !== undefined) {
					form.setValue(name, field.value);
				}
			}
		}
	}, [formSchema]);

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
		const v = values as Record<string, unknown>;
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
			<form
				data-testid="dynamic-form"
				onSubmit={form.handleSubmit(beforeSubmit, onValidationErrors)}
				className="space-y-8"
			>
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
							<AccordionItem
								value={`accordion-${option}`}
								className="rounded-xl border border-slate-200 bg-slate-100 px-2 [&[data-state=closed]>div]:h-0"
							>
								<AccordionTrigger data-testid={`form-accordion-trigger-${option}`}>
									{formSchema.fields[option].label}
								</AccordionTrigger>
								<AccordionContent className="flex flex-col gap-6 p-5 [&_*[aria-hidden='true']]:h-0!" forceMount>
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
				<FormActions mode={mode} isLoading={isLoading} onCancel={onCancel} onDelete={onDelete} />
			</form>
			{/* TODO: add proper loading state */}
			{isLoading && (
				<div className="absolute top-0 right-0 flex h-full w-full items-center justify-center bg-white opacity-80">
					<SpinnerIcon />
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
	zodSchema: z.ZodObject<any>;
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
		const def = getDef(key, zodSchema, parentOption);
		if (isOptional(key, zodSchema, parentOption)) {
			return (def as { innerType?: { _def?: { values?: Record<string, string> } } }).innerType?._def?.values ?? {};
		}
		return getType(key, zodSchema, parentOption) === 'ZodEnum'
			? ((def as { values?: Record<string, string> }).values ?? {})
			: {};
	};

	const getDateMinMax = (key: string, parentOption?: string): { min?: Date; max?: Date } => {
		let def = getDef(key, zodSchema, parentOption);
		if (isOptional(key, zodSchema, parentOption)) {
			def = (def as { innerType?: { _def?: unknown } }).innerType?._def;
		}
		const dateConstraints: { min?: Date; max?: Date } = {};
		const checks = (def as { checks?: { kind?: string; value?: string | number | Date }[] } | undefined)?.checks;

		if (checks) {
			for (const check of checks) {
				if (check.kind === 'min' && check.value !== undefined) {
					dateConstraints.min = new Date(check.value);
				} else if (check.kind === 'max' && check.value !== undefined) {
					dateConstraints.max = new Date(check.value);
				}
			}
		}

		return dateConstraints;
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
										disabled={formFieldSchema.disabled || isLoading || readOnly}
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
										disabled={formFieldSchema.disabled || isLoading || readOnly}
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
								<Label>{label}</Label>
								<FormControl>
									<DatePicker
										disabled={formFieldSchema.disabled || isLoading || readOnly}
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
											disabled={formFieldSchema.disabled || isLoading || readOnly}
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
									disabled={formFieldSchema.disabled || isLoading || readOnly}
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
							<FormItem className="flex gap-2">
								<Label htmlFor={optionKey}>{label}</Label>
								<Switch
									id={optionKey}
									disabled={formFieldSchema.disabled || isLoading || readOnly}
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
											setValueAs: (v) => (typeof v === 'string' && v !== '' ? parseFloat(v) : null),
										})}
										disabled={formFieldSchema.disabled || isLoading || readOnly}
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
