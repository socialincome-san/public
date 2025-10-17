import { Button } from '@/app/portal/components/button';
import { DatePicker } from '@/app/portal/components/datePicker';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/app/portal/components/form';
import { Input } from '@/app/portal/components/input';
import { Label } from '@/app/portal/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpinnerIcon } from '@socialincome/ui/src/icons/spinner';
import { FC, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import z from 'zod';

export interface FormSchema {
	[key: string]:
		| {
				label: string;
				placeholder?: string;
				defaultValue?: string;
				value?: string;
		  }
		| FormSchema;
}

const getDef = (key: keyof z.infer<typeof zodSchema>, zodSchema: z.ZodObject<any>, parentKey?: string) => {
	return parentKey ? zodSchema.shape[parentKey]?._def.shape()[key]?._def : zodSchema.shape[key]?._def;
};

const getType = (key: keyof z.infer<typeof zodSchema>, zodSchema: z.ZodObject<any>, parentKey?: string): string => {
	const def = getDef(key, zodSchema, parentKey);
	const type = def.typeName;
	if (type === 'ZodOptional') return def.innerType._def.typeName;
	return type;
};

const DynamicForm: FC<{
	formSchema: FormSchema;
	zodSchema: z.ZodObject<any>;
	isLoading: boolean;

	onSubmit: (values: any) => {};
}> = ({ formSchema, zodSchema, isLoading, onSubmit }) => {
	const form = useForm<z.infer<typeof zodSchema>>({
		resolver: zodResolver(zodSchema),
		defaultValues: {
			name: '',
			contactFirstName: '',
			contactLastName: '',
		},
	});

	// set form values if available
	useEffect(() => {
		for (const [name, field] of Object.entries(formSchema)) {
			if (!('label' in formSchema[name])) {
				//nested
				for (const [nestedName, nestedField] of Object.entries(formSchema[name])) {
					console.log(`setting value "${nestedField.value}" for "${name}.${nestedName}"`);
					if (formSchema[name][nestedName].value) form.setValue(`${name}.${nestedName}`, nestedField.value);
				}
			}
			if (formSchema[name].value) form.setValue(name, field.value);
		}
	}, [formSchema]);

	// TODO
	const getOptions = (nestedKey?: string): string[] => {
		return nestedKey ? zodSchema.shape[nestedKey]?.keyof().options : zodSchema.keyof().options;
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{getOptions().map((option) => {
					return getType(option, zodSchema) === 'ZodObject' ? (
						<div key={option} className="flex flex-col gap-6 border-2 border-slate-100 p-5">
							{getOptions(option).map((nestedOption) => (
								<GenericFormField
									option={nestedOption}
									zodSchema={zodSchema}
									form={form}
									formSchema={formSchema}
									isLoading={isLoading}
									parentOption={option}
									key={nestedOption}
								/>
							))}
						</div>
					) : (
						<GenericFormField
							option={option}
							zodSchema={zodSchema}
							form={form}
							formSchema={formSchema}
							isLoading={isLoading}
							key={option}
						/>
					);
				})}
				<Button disabled={isLoading} type="submit">
					Submit
				</Button>
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
}: {
	option: string;
	zodSchema: z.ZodObject<any>;
	form: UseFormReturn;
	formSchema: FormSchema;
	isLoading: boolean;
	parentOption?: string;
}) => {
	const optionKey = parentOption ? `${parentOption}.${option}` : option;

	const formFieldSchema = parentOption
		? formSchema[parentOption] && formSchema[parentOption][option]
		: formSchema[option];

	const getEnumValues = (key: keyof z.infer<typeof zodSchema>, parentOption?: string) => {
		const def = getDef(key, zodSchema, parentOption);
		if (def.typeName === 'ZodOptional') return def.innerType._def.values;
		return getType(key, zodSchema, parentOption) === 'ZodNativeEnum' && def.values;
	};

	const isOptional = (key: keyof z.infer<typeof zodSchema>, parentOption?: string) => {
		const def = getDef(key, zodSchema, parentOption);
		const type = def.typeName;
		return type === 'ZodOptional';
	};

	const label = `${formFieldSchema.label} ${!isOptional(option, parentOption) ? '*' : ''}`;

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
								<Input placeholder={formFieldSchema.placeholder} {...form.register(optionKey)} disabled={isLoading} />
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
								<DatePicker {...form.register(optionKey)} onSelect={field.onChange} selected={field.value} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			);
		case 'ZodNativeEnum':
			return (
				<FormField
					control={form.control}
					name={optionKey}
					key={optionKey}
					render={({ field }) => (
						<FormItem>
							<Label>{label}</Label>
							<Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={formFieldSchema.placeholder} />
									</SelectTrigger>
								</FormControl>
								<SelectContent {...form.register(optionKey)}>
									{Object.keys(getEnumValues(option, parentOption)).map((key) => (
										<SelectItem value={key} key={key}>
											{key}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
			);
		default:
			break;
	}
};

export default DynamicForm;
