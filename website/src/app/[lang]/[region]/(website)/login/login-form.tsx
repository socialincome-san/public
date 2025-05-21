'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useEmailAuthentication } from '@/hooks/useEmailAuthentication';
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
	};
} & DefaultParams;

export default function LoginForm({ lang, region, translations }: LoginFormProps) {
	const { signIn, sendLinkEmail, loading, emailSent, isSignIn } = useEmailAuthentication({
		lang,
		region,
		translations,
	});

	const formSchema = z.object({
		email: z.string().email({ message: translations.invalidEmail }),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

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
				onSubmit={form.handleSubmit((values) => (isSignIn ? signIn(values.email) : sendLinkEmail(values.email)))}
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
				<Button type="submit" className="mt-8" showLoadingSpinner={loading}>
					{translations.submitButton}
				</Button>
			</form>
		</Form>
	);
}
