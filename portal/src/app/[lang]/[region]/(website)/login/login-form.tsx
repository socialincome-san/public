'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { FirebaseError } from 'firebase/app';
import { browserSessionPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from 'reactfire';
import * as z from 'zod';

type LoginFormProps = {
	translations: {
		title: string;
		email: string;
		password: string;
		forgotPassword: string;
		submitButton: string;

		// Errors
		invalidEmail: string;
		invalidUserOrPassword: string;
	};
} & DefaultParams;

export default function LoginForm({ lang, region, translations }: LoginFormProps) {
	const router = useRouter();
	const auth = useAuth();
	const [submitting, setSubmitting] = useState(false);

	const formSchema = z.object({
		email: z.string().email({ message: translations.invalidEmail }),
		password: z.string(),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '', password: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		setSubmitting(true);
		await auth.setPersistence(browserSessionPersistence);
		await signInWithEmailAndPassword(auth, values.email, values.password)
			.then(() => {
				router.push(`/${lang}/${region}/me`);
			})
			.catch((error: FirebaseError) => {
				setSubmitting(false);
				if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found')
					toast.error(translations.invalidUserOrPassword);
			});
	};

	return (
		<Form {...form}>
			<form className="flex flex-col space-y-2 text-center" onSubmit={form.handleSubmit(onSubmit)}>
				<Typography weight="bold" size="2xl" className="mb-4">
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
				<Button type="submit" className="mt-8" showLoadingSpinner={submitting}>
					{translations.submitButton}
				</Button>
			</form>
		</Form>
	);
}
