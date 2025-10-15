import { Button } from '@/app/portal/components/button';
import { DatePicker } from '@/app/portal/components/datePicker';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/app/portal/components/form';
import { Input } from '@/app/portal/components/input';
import { Label } from '@/app/portal/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/portal/components/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpinnerIcon } from '@socialincome/ui/src/icons/spinner';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

export interface FormSchema {
	[key: string]: {
		label: string;
		placeholder?: string;
		defaultValue?: string;
		value?: string;
	};
}
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
			if (formSchema[name].value) form.setValue(name, field.value);
		}
	}, [formSchema]);

	// TODO
	const getOptions = (): string[] => {
		return zodSchema.keyof().options;
	};

	// TODO
	const getType = (key: keyof z.infer<typeof zodSchema>): string => {
		const type = zodSchema.shape[key]?._def.typeName;
		if (type === 'ZodOptional') return zodSchema.shape[key]?._def.innerType._def.typeName;
		return type;
	};
	const getEnumValues = (key: keyof z.infer<typeof zodSchema>) => {
		if (zodSchema.shape[key]?._def.typeName === 'ZodOptional') return zodSchema.shape[key]?._def.innerType._def.values;
		return getType(key) === 'ZodNativeEnum' && zodSchema.shape[key]?._def.values;
	};

	console.log('schema: ', zodSchema);
	console.log('options: ', getOptions());
	console.log(
		'type: ',
		getOptions(),
		getOptions().map((o) => getType(o)),
	);
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{getOptions().map((option) => {
					switch (getType(option)) {
						case 'ZodString':
							return (
								<FormField
									control={form.control}
									name={option}
									key={option}
									render={({ field }) => (
										<FormItem>
											<Label>{formSchema[option].label}</Label>
											<FormControl>
												<Input placeholder={formSchema[option].placeholder} {...field} disabled={isLoading} />
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
									name={option}
									key={option}
									render={({ field }) => (
										<FormItem>
											<Label>{formSchema[option].label}</Label>
											<FormControl>
												{/* TODO: add in/outputs */}
												<DatePicker onSelect={field.onChange} selected={field.value} />
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
									name={option}
									key={option}
									render={({ field }) => (
										<FormItem>
											<Label>{formSchema[option].label}</Label>
											<Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder={formSchema[option].placeholder} />
													</SelectTrigger>
												</FormControl>
												<SelectContent {...field}>
													{Object.keys(getEnumValues(option)).map((key) => (
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

export default DynamicForm;
