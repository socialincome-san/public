'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from 'reactfire';
import * as z from 'zod';

// TODO: i18n
export default function Page({ params }: DefaultPageProps) {
	const auth = useAuth();

	const formSchema = z.object({
		email: z.string().email({ message: 'Invalid Email' }),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (values: { email: string }) => {
		const message = 'You should have received an email with a link to reset your password.';

		await sendPasswordResetEmail(auth, values.email)
			.then(() => {
				toast.success(message);
			})
			.catch(async (error: FirebaseError) => {
				// If the auth user does not exist, we need to call our API and check if there exists a firestore user with the
				// same email and create an auth user for it. Then we can send the password reset email.
				if (error.code === 'auth/user-not-found') {
					const responseJSON = await (
						await fetch('/api/user/create-auth-user', {
							method: 'POST',
							body: JSON.stringify(values),
						})
					).json();
					if (responseJSON.created) {
						sendPasswordResetEmail(auth, values.email).then(() => {
							toast.success(message);
						});
					} else {
						toast.success(message);
					}
				}
			});
	};

	return (
		<Form {...form}>
			<form className="mx-auto flex max-w-lg flex-col space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
				<Typography weight="bold" size="3xl" className="my-4">
					Reset Password
				</Typography>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="email" placeholder="Email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
}
