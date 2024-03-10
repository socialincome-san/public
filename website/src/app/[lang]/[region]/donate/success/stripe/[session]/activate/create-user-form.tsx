'use client';

import { UpdateUserData } from '@/app/api/user/update/route';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
		passwordConfirm: string;
		passwordsMismatch: string;
		submitButton: string;
		invalidEmail: string;
	};
};

export function CreateUserForm({ checkoutSessionId, email, onSuccessURL, translations }: CreateUserFormProps) {
	const router = useRouter();
	const auth = useAuth();
	const [submitting, setSubmitting] = useState(false);

	const formSchema = z
		.object({
			email: z.string().email({ message: translations.invalidEmail }),
			password: z.string().min(6),
			passwordConfirmation: z.string(),
		})
		.superRefine((data, ctx) => {
			if (data.password !== data.passwordConfirmation)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: translations.passwordsMismatch,
					path: ['passwordConfirmation'],
				});
		});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: email, password: '', passwordConfirmation: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		setSubmitting(true);
		createUserWithEmailAndPassword(auth, email, values.password)
			.then(async (result) => {
				const data: UpdateUserData = {
					stripeCheckoutSessionId: checkoutSessionId,
					user: { auth_user_id: result.user.uid },
				};
				fetch('/api/user/update', { method: 'POST', body: JSON.stringify(data) }).then((response) => {
					if (!response.ok) throw new Error('Failed to update auth_user_id');
					router.push(onSuccessURL);
				});
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
					name="passwordConfirmation"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder={translations.passwordConfirm} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" showLoadingSpinner={submitting}>
					{translations.submitButton}
				</Button>
			</form>
		</Form>
	);
}
