'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { EMPLOYERS_FIRESTORE_PATH, Employer } from '@socialincome/shared/src/types/employers';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input } from '@socialincome/ui';
import { Timestamp, addDoc, collection, doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { useFirestore } from 'reactfire';
import * as z from 'zod';
import { useUserContext } from '../user-context-provider';

export type AddEmployerFormProps = {
	translations: {
		addEmployer: string;
		submitButton: string;
	};
	onNewEmployerSubmitted: () => void;
};

export function AddEmployerForm({ onNewEmployerSubmitted, translations }: AddEmployerFormProps) {
	const firestore = useFirestore();
	const { user } = useUserContext();

	const formSchema = z.object({
		employer_name: z.string().trim().min(1), // TODO : security
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			employer_name: '',
		},
	});

	const onSubmit = async (values: FormSchema) => {
		if (user) {
			const user_id = user!.id;
			let new_employer: Employer = {
				employer_name: values.employer_name,
				is_current: true,
				created: Timestamp.now(),
			};

			await addDoc(collection(firestore, USER_FIRESTORE_PATH, user_id, EMPLOYERS_FIRESTORE_PATH), new_employer).then(() => {
				form.reset();
				onNewEmployerSubmitted();
			});
		}
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
