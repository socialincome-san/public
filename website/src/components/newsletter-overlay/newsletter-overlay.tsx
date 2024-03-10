'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useTranslator } from '@/hooks/useTranslator';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailchimpSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import { COUNTRY_CODES } from '@socialincome/shared/src/types/country';
import { GENDER_OPTIONS } from '@socialincome/shared/src/types/user';
import {
	Alert,
	AlertTitle,
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

type NewsletterOverlayProps = {
	translations: {
		email: string;
		gender: string;
		country: string;
		language: string;
		alertMessage: string;
		submitButton: string;
		toastMessage: string;
	};
} & DefaultParams;

export default function NewsletterOverlay({ lang, region, translations }: NewsletterOverlayProps) {
	const commonTranslator = useTranslator(lang, 'common');
	const countryTranslator = useTranslator(lang, 'countries');
	const [showOverlay, setShowOverlay] = useState(false);

	const [overlayManuallyClosed, setOverlayManuallyClosed] = useState(false);

	const formSchema = z.object({
		gender: z.enum(GENDER_OPTIONS),
		email: z.string().email(),
		country: z.enum(['', ...COUNTRY_CODES]).optional(),
		language: z.enum(['en', 'de']),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			gender: 'male' as any,
			email: '',
			country: 'CH' as any,
			language: 'en' as any,
		},
	});

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (!overlayManuallyClosed) {
				setShowOverlay(true);
			}
		}, 2000); // 20 seconds in milliseconds

		return () => clearTimeout(timerId);
	}, []);

	if (!showOverlay) {
		return null; // Render nothing if showOverlay is false
	}

	const onSubmit = async (values: FormSchema) => {
		const data: MailchimpSubscriptionData = {
			email: values.email,
			country: region,
			language: lang,
			status: 'subscribed',
		};
		// Call the API to create a new Stripe checkout session
		fetch('/api/mailchimp/updateSubscription', { method: 'POST', body: JSON.stringify(data) }).then((response) => {
			if (response.status === 200) {
				setOverlayManuallyClosed(true);
				setShowOverlay(false);
				toast.success(translations.toastMessage);
			}
		});
	};

	return (
		<div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-800 bg-opacity-60">
			<div className="min-w-[50%] max-w-3xl rounded-lg bg-white p-8 shadow-lg">
				<button
					className="absolute right-0 top-0 m-2 rounded-full bg-gray-300 p-2 hover:bg-gray-400"
					onClick={() => {
						setShowOverlay(false);
						setOverlayManuallyClosed(true);
					}}
				>
					{' '}
					X{' '}
				</button>
				<Alert variant="primary" className="mb-4">
					<AlertTitle>{translations.alertMessage}</AlertTitle>
				</Alert>
				<Form {...form}>
					<form className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.email}</FormLabel>
									<FormControl>
										<Input type="email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="gender"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.gender}</FormLabel>
									<Select onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder={field.value && commonTranslator?.t(`genders.${field.value}`)} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="male">{commonTranslator?.t('genders.male')}</SelectItem>
											<SelectItem value="female">{commonTranslator?.t('genders.female')}</SelectItem>
											<SelectItem value="other">{commonTranslator?.t('genders.other')}</SelectItem>
											<SelectItem value="private">{commonTranslator?.t('genders.private')}</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="country"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.country}</FormLabel>
									<Select onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue>{field.value && countryTranslator?.t(field.value)}</SelectValue>
											</SelectTrigger>
										</FormControl>
										<SelectContent className="max-h-[16rem] overflow-y-auto">
											<SelectGroup>
												{COUNTRY_CODES.map((country) => (
													<SelectItem key={country} value={country}>
														{countryTranslator?.t(country)}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="language"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.language}</FormLabel>
									<Select onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue>{field.value && commonTranslator?.t(`languages.${field.value}`)}</SelectValue>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="en">{commonTranslator?.t('languages.en')}</SelectItem>
											<SelectItem value="de">{commonTranslator?.t('languages.de')}</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							variant="ghost"
							type="submit"
							className="col-span-2 mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white"
						>
							{translations.submitButton}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
