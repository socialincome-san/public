'use client';

import { Button } from '@/components/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';

import { updateSelfAction } from '@/lib/server-actions/contributor-actions';
import { ContributorSession, ContributorUpdateInput } from '@/lib/services/contributor/contributor.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContributorReferralSource, Gender } from '@prisma/client';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
	firstName: z.string().min(1, 'Required'),
	lastName: z.string().min(1, 'Required'),
	email: z.string().email('Invalid email').default(''),

	country: z.string().default(''),
	gender: z.nativeEnum(Gender).optional(),
	referral: z.nativeEnum(ContributorReferralSource).optional(),

	street: z.string().default(''),
	number: z.string().default(''),
	city: z.string().default(''),
	zip: z.string().default(''),
});

type FormSchema = z.infer<typeof formSchema>;

export type ProfileFormTranslations = {
	personalInfoTitle: string;
	addressTitle: string;
	firstName: string;
	lastName: string;
	email: string;
	country: string;
	gender: string;
	howDidYouHear: string;
	selectGenderPlaceholder: string;
	selectOptionPlaceholder: string;
	genderMale: string;
	genderFemale: string;
	genderOther: string;
	genderPrivate: string;
	referralFamily: string;
	referralWork: string;
	referralSocial: string;
	referralMedia: string;
	referralPresentation: string;
	referralOther: string;
	street: string;
	number: string;
	city: string;
	zip: string;
	saveButton: string;
	updateError: string;
};

export function ProfileForm({ contributor, translations }: { contributor: ContributorSession; translations: ProfileFormTranslations }) {
	const [errorMessage, setErrorMessage] = useState('');
	const [isPending, startTransition] = useTransition();

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: contributor.firstName ?? '',
			lastName: contributor.lastName ?? '',
			email: contributor.email ?? '',
			country: contributor.country ?? '',
			gender: contributor.gender ?? undefined,
			referral: contributor.referral ?? undefined,
			street: contributor.street ?? '',
			number: contributor.number ?? '',
			city: contributor.city ?? '',
			zip: contributor.zip ?? '',
		},
	});

	const loading = form.formState.isSubmitting || isPending;

	const onSubmit = (values: FormSchema) => {
		setErrorMessage('');

		startTransition(async () => {
			const { firstName, lastName, email, country, gender, referral, street, number, city, zip } = values;

			const updateInput: ContributorUpdateInput = {
				id: contributor.id,
				referral: referral ?? contributor.referral ?? ContributorReferralSource.other,
				contact: {
					update: {
						data: {
							firstName,
							lastName,
							email,
							gender: gender ?? null,
							address: {
								upsert: {
									update: {
										street: street || '',
										number: number || '',
										city: city || '',
										zip: zip || '',
										country: country || '',
									},
									create: {
										street: street || '',
										number: number || '',
										city: city || '',
										zip: zip || '',
										country: country || '',
									},
								},
							},
						},
					},
				},
			};

			const result = await updateSelfAction(contributor.id, updateInput);

			if (!result.success) {
				setErrorMessage(result.error || 'Could not update profile');
			}
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-8">
				<h3 className="text-lg font-semibold md:col-span-2">{translations.personalInfoTitle}</h3>

				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.firstName}</FormLabel>
							<FormControl>
								<Input {...field} disabled={loading} />
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
								<Input {...field} disabled={loading} />
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
								<Input type="email" {...field} readOnly disabled aria-disabled />
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
							<FormControl>
								<Input {...field} disabled={loading} />
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
							<Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={translations.selectGenderPlaceholder} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="male">{translations.genderMale}</SelectItem>
									<SelectItem value="female">{translations.genderFemale}</SelectItem>
									<SelectItem value="other">{translations.genderOther}</SelectItem>
									<SelectItem value="private">{translations.genderPrivate}</SelectItem>
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
							<FormLabel>{translations.howDidYouHear}</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={translations.selectOptionPlaceholder} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="familyfriends">{translations.referralFamily}</SelectItem>
									<SelectItem value="work">{translations.referralWork}</SelectItem>
									<SelectItem value="socialmedia">{translations.referralSocial}</SelectItem>
									<SelectItem value="media">{translations.referralMedia}</SelectItem>
									<SelectItem value="presentation">{translations.referralPresentation}</SelectItem>
									<SelectItem value="other">{translations.referralOther}</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<h3 className="mt-4 text-lg font-semibold md:col-span-2">{translations.addressTitle}</h3>

				<FormField
					control={form.control}
					name="street"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.street}</FormLabel>
							<FormControl>
								<Input {...field} disabled={loading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="number"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.number}</FormLabel>
							<FormControl>
								<Input {...field} disabled={loading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="city"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.city}</FormLabel>
							<FormControl>
								<Input {...field} disabled={loading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="zip"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{translations.zip}</FormLabel>
							<FormControl>
								<Input {...field} disabled={loading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{errorMessage ? <div className="text-destructive md:col-span-2">{errorMessage || translations.updateError}</div> : null}

				<div className="flex justify-start pt-4 md:col-span-2">
					<Button type="submit" disabled={loading}>
						{translations.saveButton}
					</Button>
				</div>
			</form>
		</Form>
	);
}
