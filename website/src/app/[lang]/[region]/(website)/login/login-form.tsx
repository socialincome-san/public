'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useEmailLogin } from '@/lib/firebase/hooks/useEmailLogin';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@mui/material';
import {
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
	Input,
	Typography,
} from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type LoginFormProps = {
	translations: {
		title: string;
		email: string;
		submitButton: string;
		checkEmail: string;
		invalidEmail: string;
		confirmEmail: string;
		confirmEmailTitle: string;
		backToLogin: string;
		signingIn: string;
	};
} & DefaultParams;

export default function LoginForm({ lang, region, translations }: LoginFormProps) {
	const router = useRouter();
	const { sendSignInEmail, sendingEmail, signingIn, emailSent } = useEmailLogin({
		lang,
		onLoginSuccess: async () => {
			router.push(`/${lang}/${region}/dashboard/contributions`);
		},
	});

	const formSchema = z.object({
		email: z.string().email({ message: translations.invalidEmail }),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	if (signingIn) {
		return <div>{translations.signingIn}</div>;
	}

	if (emailSent) {
		return (
			<div className="flex flex-col items-center justify-center">
				<Card className="theme-default bg-white">
					<CardHeader>
						<Typography weight="bold" size="2xl">
							{translations.confirmEmailTitle}
						</Typography>
					</CardHeader>
					<CardContent>
						<Typography>{translations.checkEmail}</Typography>
					</CardContent>
					<CardFooter>
						<Link href={`/${lang}/${region}/login`}>{translations.backToLogin}</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col space-y-2 text-center"
				onSubmit={form.handleSubmit((values) => sendSignInEmail(values.email))}
			>
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
				<Button type="submit" className="mt-8" showLoadingSpinner={sendingEmail}>
					{translations.submitButton}
				</Button>
			</form>
		</Form>
	);
}
