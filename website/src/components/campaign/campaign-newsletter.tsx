'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input/input';
import { subscribeToNewsletterAction } from '@/lib/server-actions/newsletter-actions';
import type { CreateNewsletterSubscription } from '@/lib/services/sendgrid/types';
import type { LanguageCode } from '@/lib/types/language';
import { zodResolver } from '@hookform/resolvers/zod';
import NextImage from 'next/image';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

type CampaignNewsletterTranslations = {
	firstNameLabel: string;
	emailLabel: string;
	emailPlaceholder: string;
	buttonAddSubscriber: string;
	sentBy: string;
	toastSuccess: string;
	toastFailure: string;
};

const NEWSLETTER_IMAGE_SIZE = 60;

type Props = {
	lang: LanguageCode;
	title: string;
	senderName: string;
	imageSrc: string | null;
	imageAlt: string;
	translations: CampaignNewsletterTranslations;
};

export const CampaignNewsletter = ({ lang, title, senderName, imageSrc, imageAlt, translations }: Props) => {
	const formSchema = z.object({
		firstname: z.string(),
		email: z.string().email(),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { firstname: '', email: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		const trimmedFirstName = values.firstname.trim();
		const data: CreateNewsletterSubscription = {
			email: values.email,
			language: lang === 'de' ? 'de' : 'en',
			...(trimmedFirstName ? { firstname: trimmedFirstName } : {}),
		};

		try {
			await subscribeToNewsletterAction(data);
			toast.success(translations.toastSuccess);
			form.reset();
		} catch {
			toast.error(translations.toastFailure);
		}
	};

	const trimmedTitle = title.trim();
	const trimmedSenderName = senderName.trim();

	return (
		<BlockWrapper className="my-8 md:my-12 lg:my-16">
			<div className="border-border bg-card flex flex-col gap-8 rounded-3xl border p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.1)] md:gap-10 md:p-10">
				{trimmedTitle ? <h2 className="text-foreground text-3xl leading-9 font-medium">{trimmedTitle}</h2> : null}

				<div className="flex flex-col gap-8">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end"
						>
							<FormField
								control={form.control}
								name="firstname"
								render={({ field }) => (
									<FormItem className="min-w-0 flex-1">
										<FormLabel>{translations.firstNameLabel}</FormLabel>
										<FormControl>
											<Input type="text" autoComplete="given-name" className="h-9 rounded-full" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="min-w-0 flex-1">
										<FormLabel>{translations.emailLabel}</FormLabel>
										<FormControl>
											<Input
												type="email"
												autoComplete="email"
												placeholder={translations.emailPlaceholder}
												className="h-9 rounded-full"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="h-9 shrink-0 sm:self-end">
								{translations.buttonAddSubscriber}
							</Button>
						</form>
					</Form>

					{trimmedSenderName || imageSrc ? (
						<div className="flex items-center gap-3">
							<div className="size-[60px] shrink-0 overflow-hidden rounded-full border-2 border-white shadow-[0_4px_20px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
								{imageSrc ? (
									<NextImage
										src={imageSrc}
										alt={imageAlt}
										width={NEWSLETTER_IMAGE_SIZE}
										height={NEWSLETTER_IMAGE_SIZE}
										className="size-full rounded-full object-cover"
									/>
								) : (
									<div className="bg-muted size-full rounded-full" aria-hidden />
								)}
							</div>
							{trimmedSenderName ? (
								<div className="text-foreground flex flex-col gap-1 text-base leading-6">
									<p>{translations.sentBy}</p>
									<p className="font-medium">{trimmedSenderName}</p>
								</div>
							) : null}
						</div>
					) : null}
				</div>
			</div>
		</BlockWrapper>
	);
};
