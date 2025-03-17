'use client';

import { CreateAuthUserData, CreateAuthUserResponse } from '@/app/api/user/create-auth-user/route';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Dialog,
	DialogContent,
	DialogTrigger,
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
	Input,
	Typography,
} from '@socialincome/ui';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from 'reactfire';
import * as z from 'zod';

type PasswordResetDialogProps = {
	translations: {
		emailPlaceholder: string;
		invalidEmail: string;
		resetPasswordButton: string;
		resetPasswordTitle: string;
		resetPasswordText: string;
		resetPasswordToastMessage: string;
		resetPasswordSubmitButton: string;
	};
};

export default function RequestPasswordResetDialog({ translations }: PasswordResetDialogProps) {
	const auth = useAuth();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const formSchema = z.object({
		email: z.string().email({ message: translations.invalidEmail }),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (values: { email: string }) => {
		setSubmitting(true);
		await sendPasswordResetEmail(auth, values.email)
			.catch(async (error: FirebaseError) => {
				// If the auth user does not exist, we need to call our API and check if there exists a firestore user with the
				// same email and create an auth user for it. Then we can send the password reset email.
				if (error.code === 'auth/user-not-found') {
					const data: CreateAuthUserData = { email: values.email };
					const response = (await (
						await fetch('/api/user/create-auth-user', { method: 'POST', body: JSON.stringify(data) })
					).json()) as CreateAuthUserResponse;
					if (response.created) await sendPasswordResetEmail(auth, values.email);
				}
			})
			.finally(() => {
				toast.success(translations.resetPasswordToastMessage);
				setDialogOpen(false);
				setSubmitting(false);
			});
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
			<DialogTrigger asChild>
				<Button variant="link">{translations.resetPasswordButton}</Button>
			</DialogTrigger>
			<DialogContent>
				<Form {...form}>
					<form className="flex flex-col space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<Typography weight="medium">{translations.resetPasswordTitle}</Typography>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input type="email" placeholder={translations.emailPlaceholder} {...field} />
									</FormControl>
									<FormDescription>{translations.resetPasswordText}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" showLoadingSpinner={submitting}>
							{translations.resetPasswordSubmitButton}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
