'use client';

import { UpdatePasswordData } from '@/app/api/user/update-password/route';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth, useUser } from 'reactfire';
import * as z from 'zod';

type LoginFormProps = {
	translations: {
		title: string;
		password: string;
		passwordConfirmation: string;
		submitButton: string;
		passwordsMismatch: string;
		passwordResetSuccessToast: string;
		passwordResetErrorToast: string;
	};
};

export default function UpdatePasswordForm({ translations }: LoginFormProps) {
	const auth = useAuth();
	const router = useRouter();
	const { data: authUser } = useUser();

	const formSchema = z
		.object({
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
		defaultValues: { password: '', passwordConfirmation: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		if (authUser === null) return;
		const data: UpdatePasswordData = { newPassword: values.password };
		const response = await fetch('/api/user/update-password', { method: 'POST', body: JSON.stringify(data) });
		if (response.ok) {
			signOut(auth).then(() => {
				router.push('/login');
				toast.success(translations.passwordResetSuccessToast, { duration: 10000 });
			});
		} else {
			toast.error(translations.passwordResetErrorToast);
		}
	};

	return (
		<Form {...form}>
			<form className="max-w-md space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
				<Typography weight="medium" size="lg" className="my-4">
					{translations.title}
				</Typography>
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
								<Input type="password" placeholder={translations.passwordConfirmation} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="mt-8">
					{translations.submitButton}
				</Button>
			</form>
		</Form>
	);
}
