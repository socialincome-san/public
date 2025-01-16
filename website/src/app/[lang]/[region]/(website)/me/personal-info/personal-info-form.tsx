'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import {
	useNewsletterSubscription,
	useUpsertNewsletterSubscription,
	useUser,
} from '@/app/[lang]/[region]/(website)/me/hooks';
import { useTranslator } from '@/hooks/useTranslator';
import { DocumentData } from '@firebase/firestore';
import { zodResolver } from '@hookform/resolvers/zod';
import { COUNTRY_CODES } from '@socialincome/shared/src/types/country';
import { GENDER_OPTIONS, USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types/user';
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Label,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Switch,
} from '@socialincome/ui';
import { useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useFirestore } from 'reactfire';
import * as z from 'zod';

type PersonalInfoFormProps = {
	translations: {
		firstname: string;
		lastname: string;
		gender: string;
		email: string;
		street: string;
		streetNumber: string;
		city: string;
		zip: string;
		country: string;
		language: string;
		submitButton: string;
		userUpdatedToast: string;
		newsletterSwitch: string;
	};
} & DefaultParams;

export function PersonalInfoForm({ lang, translations }: PersonalInfoFormProps) {
	const firestore = useFirestore();
	const user = useUser();
	const queryClient = useQueryClient();
	const commonTranslator = useTranslator(lang, 'common');
	const countryTranslator = useTranslator(lang, 'countries');
	const { status, isLoading } = useNewsletterSubscription();
	const upsertNewsletterSubscription = useUpsertNewsletterSubscription();

	const formSchema = z.object({
		firstname: z.string(),
		lastname: z.string(),
		gender: z.enum(GENDER_OPTIONS),
		email: z.string().email(),
		street: z.string(),
		streetNumber: z.string(),
		city: z.string(),
		zip: z.coerce.number(),
		country: z.enum(COUNTRY_CODES).optional(),
		language: z.enum(['en', 'de']),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstname: user.get('personal.name'),
			lastname: user.get('personal.lastname'),
			gender: user.get('personal.gender'),
			email: user.get('email'),
			street: user.get('address.street'),
			streetNumber: user.get('address.number'),
			city: user.get('address.city'),
			zip: user.get('address.zip'),
			country: user.get('address.country'),
			language: user.get('language'),
		},
	});

	const onSubmit = async (values: FormSchema) => {
		await updateDoc<DocumentData, Partial<User>>(doc(firestore, USER_FIRESTORE_PATH, user.id), {
			personal: {
				name: values.firstname,
				lastname: values.lastname,
				gender: values.gender,
			},
			language: values.language,
			email: values.email,
			address: {
				street: values.street,
				number: values.streetNumber,
				city: values.city,
				zip: values.zip,
				...(values.country && { country: values.country }),
			},
		}).then(() => {
			toast.success(translations.userUpdatedToast);
			queryClient.invalidateQueries({ queryKey: ['me', user.get('auth_user_id')] });
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
				<div className="flex flex-row space-x-2">
					<FormField
						control={form.control}
						name="street"
						render={({ field }) => (
							<FormItem className="flex w-3/4 flex-col">
								<FormLabel>{translations.street}</FormLabel>
								<FormControl>
									<Input type="text" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="streetNumber"
						render={({ field }) => (
							<FormItem className="flex w-1/4 flex-col">
								<FormLabel>{translations.streetNumber}</FormLabel>
								<FormControl>
									<Input type="text" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex flex-row space-x-2">
					<FormField
						control={form.control}
						name="zip"
						render={({ field }) => (
							<FormItem className="flex w-1/4 flex-col">
								<FormLabel>{translations.zip}</FormLabel>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="city"
						render={({ field }) => (
							<FormItem className="flex w-3/4 flex-col">
								<FormLabel>{translations.city}</FormLabel>
								<FormControl>
									<Input type="text" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
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
										<SelectValue placeholder={field.value && commonTranslator?.t(`languages.${field.value}`)} />
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
				<Button variant="default" type="submit" className="md:col-span-2">
					{translations.submitButton}
				</Button>
			</form>
			<div className="flex items-center space-x-2">
				<Switch
					id="newsletter-switch"
					checked={status === 'subscribed'}
					disabled={isLoading}
					onCheckedChange={async (enabled) => {
						if (enabled) {
							await upsertNewsletterSubscription('subscribed');
						} else {
							await upsertNewsletterSubscription('unsubscribed');
						}
					}}
				/>
				<Label htmlFor="newsletter-switch">{translations.newsletterSwitch}</Label>
			</div>
		</Form>
	);
}
