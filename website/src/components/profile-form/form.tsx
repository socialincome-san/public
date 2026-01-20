'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { Button } from '@/components/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Switch } from '@/components/switch';

import { mainWebsiteLanguages } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { COUNTRY_CODES, CountryCode } from '@/lib/types/country';
import { Cause, ContributorReferralSource, Gender } from '@prisma/client';
import { MultiSelect, MultiSelectOption } from '../multi-select';
import { buildDefaultValues } from './defaults';
import { ProfileFormValues, profileFormSchema } from './schemas';
import { submitProfileForm } from './submit';
import { ProfileFormTranslations } from './translated-form';

type Props = {
	session: ContributorSession | LocalPartnerSession;
	translations: ProfileFormTranslations;
	isNewsletterSubscribed?: boolean;
};

export function ProfileForm({ session, translations, isNewsletterSubscribed = false }: Props) {
	const [errorMessage, setErrorMessage] = useState('');

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: buildDefaultValues(session, isNewsletterSubscribed),
	});

	const loading = form.formState.isSubmitting;
	const isContributor = session.type === 'contributor';
	const isLocalPartner = session.type === 'local-partner';

	const onSubmit = async (values: ProfileFormValues) => {
		setErrorMessage('');
		const result = await submitProfileForm(values, session, isNewsletterSubscribed);

		if (!result.success) {
			setErrorMessage(result.error ?? translations.updateError);
			return;
		}

		toast.success(translations.userUpdatedToast);
		form.reset(values);
	};

	const causeOptions: MultiSelectOption[] = Object.values(Cause).map((c) => ({
		value: c,
		label: c.replace(/_/g, ' ').toLowerCase(),
	}));

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-8">
				{isLocalPartner && (
					<>
						<h3 className="text-lg font-semibold md:col-span-2">Organization Details</h3>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.name}</FormLabel>
									<FormControl>
										<Input disabled={loading} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="causes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.causes}</FormLabel>
									<MultiSelect
										options={causeOptions}
										defaultValue={field.value ?? []}
										onValueChange={(v) => field.onChange(v as Cause[])}
										disabled={loading}
										placeholder={translations.selectOptionPlaceholder}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}

				<h3 className="text-lg font-semibold md:col-span-2">{translations.personalInfoTitle}</h3>

				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.firstName}</FormLabel>
							<FormControl>
								<Input disabled={loading} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.lastName}</FormLabel>
							<FormControl>
								<Input disabled={loading} {...field} />
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
								<Input {...field} disabled readOnly aria-disabled />
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
							<Select defaultValue={field.value} onValueChange={field.onChange} disabled={loading}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={translations.selectOptionPlaceholder} />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="max-h-[16rem] overflow-y-auto">
									{COUNTRY_CODES.map((c: CountryCode) => (
										<SelectItem key={c} value={c}>
											{translations.countries[c]}
										</SelectItem>
									))}
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
							<Select defaultValue={field.value} onValueChange={field.onChange} disabled={loading}>
								<FormControl>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{mainWebsiteLanguages.map((l) => (
										<SelectItem key={l} value={l}>
											{l.toUpperCase()}
										</SelectItem>
									))}
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
							<Select defaultValue={field.value} onValueChange={field.onChange} disabled={loading}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={translations.selectGenderPlaceholder} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value={Gender.male}>{translations.genderMale}</SelectItem>
									<SelectItem value={Gender.female}>{translations.genderFemale}</SelectItem>
									<SelectItem value={Gender.other}>{translations.genderOther}</SelectItem>
									<SelectItem value={Gender.private}>{translations.genderPrivate}</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{isContributor && (
					<FormField
						control={form.control}
						name="referral"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{translations.howDidYouHear}</FormLabel>
								<Select defaultValue={field.value} onValueChange={field.onChange} disabled={loading}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder={translations.selectOptionPlaceholder} />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Object.values(ContributorReferralSource).map((r) => (
											<SelectItem key={r} value={r}>
												{
													{
														family_and_friends: translations.referralFamily,
														work: translations.referralWork,
														social_media: translations.referralSocial,
														media: translations.referralMedia,
														presentation: translations.referralPresentation,
														other: translations.referralOther,
													}[r]
												}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<h3 className="mt-4 text-lg font-semibold md:col-span-2">{translations.addressTitle}</h3>

				{(['street', 'number', 'city', 'zip'] as const).map((f) => (
					<FormField
						key={f}
						control={form.control}
						name={f}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{translations[f]}</FormLabel>
								<FormControl>
									<Input disabled={loading} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}

				{isContributor && (
					<FormField
						control={form.control}
						name="newsletter"
						render={({ field }) => (
							<FormItem>
								<div className="flex gap-3">
									<Switch disabled={loading} checked={field.value} onCheckedChange={field.onChange} />
									<Label>{translations.newsletterLabel}</Label>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{errorMessage && <div className="text-destructive md:col-span-2">{errorMessage}</div>}

				<div className="flex justify-start pt-4 md:col-span-2">
					<Button type="submit" disabled={loading}>
						{translations.saveButton}
					</Button>
				</div>
			</form>
		</Form>
	);
}
