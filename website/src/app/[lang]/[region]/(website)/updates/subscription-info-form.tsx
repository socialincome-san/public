'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useTranslator } from '@/hooks/useTranslator';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailchimpSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import { COUNTRY_CODES } from '@socialincome/shared/src/types/country';
import {
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
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

type PersonalInfoFormProps = {
	translations: {
		firstname: string;
		lastname: string;
		email: string;
		country: string;
		language: string;
		updatesSubmitButton: string;
		toastMessage: string;
		toastErrorMessage: string;
	};
} & DefaultParams;

export function SubscriptionInfoForm({ lang, translations }: PersonalInfoFormProps) {
	const commonTranslator = useTranslator(lang, 'common');
	const countryTranslator = useTranslator(lang, 'countries');

	const formSchema = z.object({
		firstname: z.string(),
		lastname: z.string(),
		email: z.string().email(),
		country: z.enum(['', ...COUNTRY_CODES]).optional(),
		language: z.enum(['en', 'de']),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstname: '',
			lastname: '',
			email: '',
			country: '' as any,
			language: '' as any,
		},
	});

	const onSubmit = async (values: FormSchema) => {
		const data: MailchimpSubscriptionData = {
			firstname: values.firstname,
			lastname: values.lastname,
			email: values.email,
			country: values.country as any,
			language: values.language,
			status: 'subscribed',
		};
		// Call the API to change Mailchimp subscription
		fetch('/api/mailchimp/subscription/public', { method: 'POST', body: JSON.stringify(data) }).then((response) => {
			if (response.status === 200) {
				toast.success(translations.toastMessage);
			} else {
				toast.error(translations.toastErrorMessage + '(' + response.statusText + ')');
			}
		});
	};

	return (
		<Form {...form}>
			<form className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="firstname"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.firstname}</FormLabel>
							<FormControl>
								<Input type="text" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastname"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.lastname}</FormLabel>
							<FormControl>
								<Input type="text" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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

				<Button variant="ghost" size="lg" type="submit" className="md:col-span-2">
					{translations.updatesSubmitButton}
				</Button>
			</form>
		</Form>
	);
}
