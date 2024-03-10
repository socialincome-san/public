'use client';

import { DefaultParams } from "@/app/[lang]/[region]";
import { useTranslator } from "@/hooks/useTranslator";
import { COUNTRY_CODES } from "@socialincome/shared/src/types/country";
import { GENDER_OPTIONS } from "@socialincome/shared/src/types/user";
import { Translator } from "@socialincome/shared/src/utils/i18n";
import { Input, Button, Label, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, Alert, AlertDescription, AlertTitle } from "@socialincome/ui";
import { useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailchimpSubscriptionData } from "@socialincome/shared/src/mailchimp/MailchimpAPI";
import toast from "react-hot-toast";

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
} & DefaultParams ;


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
			if(!overlayManuallyClosed) {
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
			status: "subscribed"
		};
		// Call the API to create a new Stripe checkout session
		fetch('/api/mailchimp/updateSubscription', { method: 'POST', body: JSON.stringify(data) })
			.then((response) => {
				if (response.status === 200) {
                    setOverlayManuallyClosed(true);
                    setShowOverlay(false);
					toast.success(translations.toastMessage);
				}
			})
		}

	return (
		<div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-gray-800 bg-opacity-60 z-50">
			<div className="bg-white p-8 rounded-lg shadow-lg min-w-[50%] max-w-3xl">
				<button
          			className="absolute top-0 right-0 m-2 p-2 rounded-full bg-gray-300 hover:bg-gray-400"
          			onClick={() => {
						setShowOverlay(false);
						setOverlayManuallyClosed(true)
					}}> X </button>
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

                        <Button variant="ghost"  type="submit" className="w-full col-span-2 bg-blue-500 text-white py-2 mt-4 px-4 rounded-md">
                                {translations.submitButton}
                        </Button>
                        </form>
                                
                </Form>
			</div>	
		</div>

		

	);
}
