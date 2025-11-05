import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/portal/components/accordion';
import { Button } from '@/app/portal/components/button';
import { Combobox } from '@/app/portal/components/combo-box';
import { DatePicker } from '@/app/portal/components/date-picker';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/app/portal/components/form';
import { Input } from '@/app/portal/components/input';
import { Label } from '@/app/portal/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import { Switch } from '@/app/portal/components/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpinnerIcon } from '@socialincome/ui/src/icons/spinner';
import { FC, useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import z, { ZodObject, ZodTypeAny } from 'zod';

export type FormField = {
	label: string;
	placeholder?: string;
	zodSchema?: ZodTypeAny;
	value?: any;
	useCombobox?: boolean;
};

export type FormSchema = {
	label: string;
	fields: {
		[key: string]: FormField | FormSchema;
	};
};

// recursively build Zod Schema from Form Schema
const buildZodSchema = (schemaDef: FormSchema): ZodObject<any> => {
	const result: Record<string, ZodTypeAny> = {};

	for (const key in schemaDef.fields) {
		const value = schemaDef.fields[key];

		if (isFormField(value) && value.zodSchema) {
			result[key] = value.zodSchema as ZodTypeAny;
		} else {
			// nested object
			result[key] = buildZodSchema(value as FormSchema);
		}
	}

	return z.object(result);
};

// Typeguard
const isFormField = (obj: any): obj is FormField => {
	return obj && typeof obj === 'object' && !('fields' in obj);
};

// get first level or nested def object from Zod Schema
const getDef = (key: keyof z.infer<typeof zodSchema>, zodSchema: z.ZodObject<any>, parentKey?: string) => {
	return parentKey ? zodSchema.shape[parentKey]?._def.shape()[key]?._def : zodSchema.shape[key]?._def;
};

// get Zod Type by Form Schema key
const getType = (key: keyof z.infer<typeof zodSchema>, zodSchema: z.ZodObject<any>, parentKey?: string): string => {
	const def = getDef(key, zodSchema, parentKey);
	let type = def.typeName;
	if (isOptional(key, zodSchema, parentKey)) type = def.innerType._def.typeName;
	if (type === 'ZodEffects') return def.innerType._def.schema._def.typeName;
	if (type === 'ZodUnion') return def.innerType._def.options[0]._def.typeName;
	if (type === 'ZodNativeEnum') return 'ZodEnum';
	return type;
};

const isOptional = (key: keyof z.infer<typeof zodSchema>, zodSchema: z.ZodObject<any>, parentOption?: string) => {
	const def = getDef(key, zodSchema, parentOption);
	const type = def.typeName;
	return ['ZodOptional', 'ZodNullable'].includes(type);
};

const DynamicForm: FC<{
	formSchema: FormSchema;
	isLoading: boolean;
	onSubmit: (values: any) => void;
	onCancel?: (values: any) => void;
	mode: 'add' | 'edit' | 'readonly';
}> = ({ formSchema, isLoading, onSubmit, onCancel, mode }) => {
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
						if (isFormField(nestedField) && nestedField.value != null)
							form.setValue(`${name}.${nestedName}`, nestedField.value);
					}
				} else if (field.value != null) {
					form.setValue(name, field.value);
				}
			}
		}
	}, [formSchema]);

	// get options from Zod Object
	const getOptions = (nestedKey?: string): string[] => {
		return nestedKey ? zodSchema.shape[nestedKey]?.keyof().options : zodSchema.keyof().options;
	};

	// TODO: move to recursive function
	// get values from Zod Schema and map back to form schema
	const beforeSubmit = (values: z.infer<typeof zodSchema>) => {
		for (const key in formSchema.fields) {
			const fields = formSchema.fields[key];

			if (isFormField(fields)) {
				fields.value = values[key];
			} else {
				// nested object
				for (const k in fields.fields) {
					const nestedField = (fields as FormSchema).fields[k];

					if (isFormField(nestedField)) {
						nestedField.value = values[key][k];
					}
				}
			}
		}
		onSubmit(formSchema);
	};

	const [openAccordion, setOpenAccordion] = useState<undefined | string | 'all'>(undefined);

	const onValidationErrors = (e: Object) => {
		console.error('dynamic form validation errors: ', e);
		setOpenAccordion('all');
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(beforeSubmit, onValidationErrors)} className="space-y-8">
				{getOptions().map((option) => {
					return getType(option, zodSchema) === 'ZodObject' ? (
						<Accordion
							key={option}
							type="single"
							collapsible
							value={openAccordion ? (openAccordion === 'all' ? `accordion-${option}` : openAccordion) : 'closed'}
							onValueChange={(value) => setOpenAccordion(value ? `accordion-${option}` : undefined)}
						>
							{/* TODO: find better solution to hide collapsed content */}
							<AccordionItem value={`accordion-${option}`} className="[&[data-state=closed]>div]:h-0">
								<AccordionTrigger>{formSchema.fields[option].label}</AccordionTrigger>
								<AccordionContent className="flex flex-col gap-6 p-5 [&_*[aria-hidden='true']]:!h-0" forceMount>
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
				<div className="flex gap-2">
					{mode !== 'readonly' && (
						<Button disabled={isLoading} type="submit">
							Save
						</Button>
					)}
					{onCancel && (
						<Button variant="outline" onClick={onCancel}>
							{mode === 'readonly' ? 'Close' : 'Cancel'}
						</Button>
					)}
				</div>
			</form>
			{/* TODO: add proper loading state */}
			{isLoading && (
				<div className="space-0 absolute right-0 top-0 flex h-full w-full items-center justify-center bg-white opacity-80">
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

	const getEnumValues = (key: keyof z.infer<typeof zodSchema>, parentOption?: string): { [key: string]: string } => {
		const def = getDef(key, zodSchema, parentOption);
		if (isOptional(key, zodSchema, parentOption)) return def.innerType._def.values;
		return getType(key, zodSchema, parentOption) === 'ZodEnum' && def.values;
	};

	const getDateMinMax = (key: keyof z.infer<typeof zodSchema>, parentOption?: string): { min?: Date; max?: Date } => {
		let def = getDef(key, zodSchema, parentOption);
		if (isOptional(key, zodSchema, parentOption)) def = def.innerType._def;
		const dateConstraints: { min?: Date; max?: Date } = {};

		if (def.checks) {
			for (const check of def.checks) {
				if (check.kind === 'min') {
					dateConstraints.min = new Date(check.value);
				} else if (check.kind === 'max') {
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
		switch (getType(option, zodSchema, parentOption)) {
			case 'ZodString':
				return (
					<FormField
						control={form.control}
						name={optionKey}
						key={optionKey}
						render={({ field }) => (
							<FormItem>
								<Label>{label}</Label>
								<FormControl>
									<Input
										placeholder={readOnly ? '-' : formFieldSchema.placeholder}
										{...form.register(optionKey)}
										disabled={isLoading || readOnly}
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
										disabled={isLoading || readOnly}
										{...form.register(optionKey)}
										onSelect={field.onChange}
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
				const items = enumValues.map(([label, value]) => ({ id: value, label }));

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
											onChange={field.onChange}
											placeholder={formFieldSchema.placeholder}
											disabled={isLoading || readOnly}
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
						render={({ field }) => (
							<FormItem>
								<Label>{label}</Label>
								<Select value={field.value} onValueChange={field.onChange} disabled={isLoading || readOnly}>
									<FormControl>
										<SelectTrigger>
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
									disabled={isLoading || readOnly}
									onCheckedChange={field.onChange}
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
						render={({ field }) => (
							<FormItem>
								<Label>{label}</Label>
								<FormControl>
									<Input
										type="number"
										placeholder={readOnly ? '-' : formFieldSchema.placeholder}
										{...form.register(optionKey, {
											// avoid NaN when input is empty, see https://github.com/orgs/react-hook-form/discussions/6980#discussioncomment-1785009
											setValueAs: (v) => (v === '' ? null : parseInt(v, 10)),
										})}
										disabled={isLoading || readOnly}
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
