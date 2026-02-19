'use client';
import { ContributorReferralSource, CountryCode } from '@/generated/prisma/enums';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { subscribeToNewsletterAction } from '@/lib/server-actions/newsletter-actions';
import { updateContributorAfterCheckoutAction } from '@/lib/server-actions/stripe-actions';
import { SupportedLanguage } from '@/lib/services/sendgrid/types';
import { UpdateContributorAfterCheckoutInput } from '@/lib/services/stripe/stripe.types';
import { COUNTRY_CODES } from '@/lib/types/country';
import { GENDER_OPTIONS } from '@/lib/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Checkbox,
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
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

type SuccessFormProps = {
	lang: WebsiteLanguage;
	onSuccessURL: string;
	stripeCheckoutSessionId: string;
	translations: {
		acceptTermsAndConditions: string;
		firstname: string;
		lastname: string;
		email: string;
		country: string;
		gender: string;
		referral: string;
		referrals: {
			familyfriends: string;
			work: string;
			socialmedia: string;
			media: string;
			presentation: string;
			other: string;
		};
		submitButton: string;
		updateUserError: string;
	};
	firstname?: string;
	lastname?: string;
	email?: string;
	country?: CountryCode;
};

export const SuccessForm = ({
	lang,
	stripeCheckoutSessionId,
	translations,
	firstname,
	lastname,
	email,
	country,
	onSuccessURL,
}: SuccessFormProps) => {
	const router = useRouter();
	const commonTranslator = useTranslator(lang, 'common');
	const countryTranslator = useTranslator(lang, 'countries');
	const [submitting, setSubmitting] = useState(false);
	const [firstCountry, ...restCountries] = COUNTRY_CODES;

	const formSchema = z.object({
		firstname: z.string().min(1),
		lastname: z.string().min(1),
		email: z.string().email(),
		country: z.enum([firstCountry, ...restCountries]),
		gender: z.enum(GENDER_OPTIONS).optional(),
		referral: z.nativeEnum(ContributorReferralSource).optional(),
		termsAndConditions: z.literal<boolean>(true),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email,
			firstname: firstname || '',
			lastname: lastname || '',
			country,
			termsAndConditions: false,
		},
	});

	const onSubmit = async (values: FormSchema) => {
		setSubmitting(true);

		try {
			const payload: UpdateContributorAfterCheckoutInput = {
				stripeCheckoutSessionId,
				user: {
					email: values.email,
					language: lang as WebsiteLanguage,
					personal: {
						name: values.firstname,
						lastname: values.lastname,
						gender: values.gender,
						referral: values.referral,
					},
					address: {
						country: values.country,
					},
				},
			};

			const result = await updateContributorAfterCheckoutAction(payload);

			await subscribeToNewsletterAction({
				firstname: values.firstname,
				lastname: values.lastname,
				email: values.email,
				language: lang as SupportedLanguage,
			});

			if (!result.success) {
				toast.error(translations.updateUserError);
				setSubmitting(false);
				return;
			}

			router.push(onSuccessURL);
		} catch (error: unknown) {
			if (error instanceof FirebaseError) {
				if (error.code === 'auth/email-already-in-use') {
					router.push('/login');
				} else {
					toast.error(translations.updateUserError);
				}
			} else {
				toast.error(translations.updateUserError);
			}

			setSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form className="grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-x-8" onSubmit={form.handleSubmit(onSubmit)}>
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
								<Input type="email" placeholder={translations.email} readOnly={Boolean(email)} {...field} />
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
										<SelectValue placeholder={field.value && countryTranslator?.t(field.value)} />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="max-h-[16rem] overflow-y-auto">
									<SelectGroup>
										{COUNTRY_CODES.map((country: CountryCode) => (
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
					name="gender"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.gender}</FormLabel>
							<Select onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger>
										<SelectValue />
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
					name="referral"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.referral}</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="familyfriends">{translations.referrals.familyfriends}</SelectItem>
									<SelectItem value="work">{translations.referrals.work}</SelectItem>
									<SelectItem value="socialmedia">{translations.referrals.socialmedia}</SelectItem>
									<SelectItem value="media">{translations.referrals.media}</SelectItem>
									<SelectItem value="presentation">{translations.referrals.presentation}</SelectItem>
									<SelectItem value="other">{translations.referrals.other}</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="termsAndConditions"
					render={({ field }) => (
						<FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0 px-2 py-4">
							<FormControl>
								<Checkbox data-testid="terms-and-conditions" checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel dangerouslySetInnerHTML={{ __html: translations.acceptTermsAndConditions }} />
							</div>
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					showLoadingSpinner={submitting}
					disabled={!form.getValues('termsAndConditions')}
					className="md:col-span-2 md:mt-4"
				>
					{translations.submitButton}
				</Button>
			</form>
		</Form>
	);
}
