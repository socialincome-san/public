'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input } from '@socialincome/ui';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useAddEmployer } from '@/app/[lang]/[region]/(website)/me/hooks';

export type AddEmployerFormProps = {
	translations: {
		addEmployer: string;
		submitButton: string;
	};
};

export function AddEmployerForm({ translations }: AddEmployerFormProps) {
	const addEmployer = useAddEmployer();
	const formSchema = z.object({
		employer_name: z.string().trim().min(1),
	});
	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			employer_name: '',
		},
	});

	const onSubmit = async (values: FormSchema) => {
		await addEmployer(values.employer_name);
		form.reset();
	};

	return (
		<Form {...form}>
			<form className="flex flex-col gap-x-4 md:flex-row" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="employer_name"
					render={({ field }) => (
						<FormItem className="grow">
							<FormControl>
								<Input type="text" {...field} placeholder={translations.addEmployer} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">{translations.submitButton}</Button>
			</form>
		</Form>
	);
}
