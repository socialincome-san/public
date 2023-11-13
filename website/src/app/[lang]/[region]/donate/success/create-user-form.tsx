'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from 'reactfire';
import * as z from 'zod';

type CreateUserFormProps = {
	email: string;
	checkoutSessionId: string;
	onSuccessURL: string;
	translations: {
		title: string;
		email: string;
		password: string;
		passwordValidation: string;
		submitButton: string;
		invalidEmail: string;
	};
};

export function CreateUserForm({ checkoutSessionId, email, onSuccessURL, translations }: CreateUserFormProps) {
	const router = useRouter();
	const auth = useAuth();

	const formSchema = z
		.object({
			email: z.string().email({ message: translations.invalidEmail }),
			password: z.string().min(8),
			passwordValidation: z.string().min(8),
		})
		.refine((data) => data.password === data.passwordValidation, {
			message: 'Passwords do not match',
			path: ['passwordValidation'],
		});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: email, password: '', passwordValidation: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		createUserWithEmailAndPassword(auth, email, values.password)
			.then(async (userCredential) => {
				const user = userCredential.user;
				await fetch(`/api/stripe/checkout/success?stripeCheckoutSessionId=${checkoutSessionId}&userId=${user.uid}`);
				router.push(onSuccessURL);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<Form {...form}>
			<form className="flex flex-col space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
				<Typography weight="bold" size="xl" className="my-4">
					{translations.title}
				</Typography>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="email" placeholder={translations.email} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder={translations.password} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="passwordValidation"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder={translations.passwordValidation} {...field} />
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
