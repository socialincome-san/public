'use client'

import { Form, FormField, FormItem, FormControl, Input, FormMessage, Button } from '@socialincome/ui';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import { useFirestore } from 'reactfire';
import { useUserContext } from '../user-context-provider';
import { Employer } from '@socialincome/shared/src/types/employers';

export type AddEmployerFormProps = {
	translations: {
		addEmployer: string,
		submitButton: string,
	},
	onNewEmployerSubmitted: () => void,
};

export function AddEmployerForm({ onNewEmployerSubmitted, translations }: AddEmployerFormProps) {
	const firestore = useFirestore();
	const { user } = useUserContext();

	const formSchema = z.object({
		employerName: z.string().trim().min(1),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			employerName: '',
		}
	});

	const onSubmit = async (values: FormSchema) => {
		if (user) {
			const userId = user!.id;
			await addDoc<Partial<Employer>>(collection(firestore, "employers"), { ...values, isCurrent: true, userId: userId, created: Timestamp.now() }).then(() => {
				form.reset();
				onNewEmployerSubmitted();
			});

		}
	};

	return (
		<Form {...form}>
			<form className="flex flex-col md:flex-row gap-x-4" onSubmit={form.handleSubmit(onSubmit)} >
				<FormField
					control={form.control}
					name="employerName"
					render={({ field }) => (
						<FormItem className='grow'>
							<FormControl>
								<Input type="text" {...field} placeholder={translations.addEmployer} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">
					{translations.submitButton}
				</Button>
			</form>
		</Form>
	);
}

