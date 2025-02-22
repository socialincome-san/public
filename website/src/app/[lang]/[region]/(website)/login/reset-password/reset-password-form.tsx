'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { FirebaseError } from 'firebase/app';
import { confirmPasswordReset } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from 'reactfire';
import * as z from 'zod';

type ResetPasswordFormProps = {
	params: DefaultParams;
	oobCode: string;
	translations: {
		title: string;
		passwordPlaceholder: string;
		confirmPasswordPlaceholder: string;
		invalidPassword: string;
		passwordsDontMatch: string;
		resetPasswordSubmitButton: string;
		resetPasswordSuccess: string;
		resetPasswordError: string;
	};
};

export default function ResetPasswordForm({ params: { lang, region }, oobCode, translations }: ResetPasswordFormProps) {
	const router = useRouter();
	const auth = useAuth();
	const [submitting, setSubmitting] = useState(false);

	const formSchema = z
		.object({
			password: z.string().min(6, { message: translations.invalidPassword }),
			confirmPassword: z.string(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: translations.passwordsDontMatch,
			path: ['confirmPassword'],
		});

	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async (values: FormSchema) => {
		setSubmitting(true);
		try {
			await confirmPasswordReset(auth, oobCode, values.password);
			toast.success(translations.resetPasswordSuccess);
			router.push(`/${lang}/${region}/login`);
		} catch (error) {
			if (error instanceof FirebaseError) {
				toast.error(translations.resetPasswordError);
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form className="flex flex-col space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<Typography weight="medium">{translations.title}</Typography>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder={translations.passwordPlaceholder} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder={translations.confirmPasswordPlaceholder} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" showLoadingSpinner={submitting}>
					{translations.resetPasswordSubmitButton}
				</Button>
			</form>
		</Form>
	);
}
