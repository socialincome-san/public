'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { zodResolver } from '@hookform/resolvers/zod';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { FirebaseError } from 'firebase/app';
import {
	GoogleAuthProvider,
	browserSessionPersistence,
	signInWithEmailAndPassword,
	signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
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
		signInWithGoogle: string;

		// Errors
		requiredField: string;
		invalidEmail: string;
		unknownUser: string;
		wrongPassword: string;
	};
} & DefaultParams;

export default function LoginForm({ lang, region, translations }: LoginFormProps) {
	const router = useRouter();
	const auth = useAuth();

	const formSchema = z.object({
		email: z.string().email({ message: translations.invalidEmail }),
		password: z.string(),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '', password: '' },
	});

	const onSubmit = useCallback(
		async (values: FormSchema) => {
			await auth.setPersistence(browserSessionPersistence);
			await signInWithEmailAndPassword(auth, values.email, values.password)
				.then(() => {
					router.push(`/${lang}/${region}/me`);
				})
				.catch((error: FirebaseError) => {
					error.code === 'auth/wrong-password' && toast.error(translations.wrongPassword);
					error.code === 'auth/user-not-found' && toast.error(translations.unknownUser);
				});
		},
		[auth, lang, region, router, translations.wrongPassword, translations.unknownUser],
	);

	const onGoogleSignIn = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
			.then(async () => {
				router.push(`/${lang}/${region}/me`);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<div className="mx-auto flex max-w-xl flex-col space-y-8">
			<Form {...form}>
				<form className="flex flex-col space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
					<Typography weight="bold" size="3xl" className="my-4">
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
					<Button type="submit" className="mt-8">
						{translations.submitButton}
					</Button>
				</form>
			</Form>
			<div className="mx-auto flex max-w-md flex-col">
				<Button variant="default" className="inline-flex" Icon={SiGoogle} onClick={onGoogleSignIn}>
					{translations.signInWithGoogle}
				</Button>
			</div>
		</div>
	);
}
