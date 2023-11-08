'use client';

import { DefaultPageProps } from '@/app/[lang]/[region]';
import { zodResolver } from '@hookform/resolvers/zod';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import { FirebaseError } from 'firebase/app';
import { browserSessionPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
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
		requiredField: string;
		invalidEmail: string;
		unknownUser: string;
		wrongPassword: string;
	};
} & DefaultPageProps;

export default function LoginForm({ params, translations }: LoginFormProps) {
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

	const onSubmit = async (values: FormSchema) => {
		await auth.setPersistence(browserSessionPersistence);
		await signInWithEmailAndPassword(auth, values.email, values.password)
			.then(() => {
				router.push(`/${params.lang}/${params.region}/me`);
			})
			.catch((error: FirebaseError) => {
				error.code === 'auth/wrong-password' && toast.error(translations.wrongPassword);
				error.code === 'auth/user-not-found' && toast.error(translations.unknownUser);
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
				<Button variant="outline" className="inline-flex" onClick={() => alert('Coming soon')}>
					<SiGoogle className="mr-2 h-5 w-5" />
					Continue with Google
				</Button>
			</div>
		</div>
	);
}
