'use client';

import { trackEvent } from '@/lib/analytics/analytics';
import type { LanguageCode } from '@/lib/types/language';
import { subscribeToNewsletterAction } from '@/modules/newsletter/newsletter.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@socialincome/design-system/forms/form/form';
import { Input } from '@socialincome/design-system/forms/input/input';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { useTranslations } from 'next-intl';
import NextImage from 'next/image';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
	firstname: z.string(),
	email: z.string().email(),
});

const NEWSLETTER_IMAGE_SIZE = 60;

type Props = {
	lang: LanguageCode;
	title?: string;
	senderName?: string;
	imageSrc?: string | null;
	imageAlt?: string;
};

export const NewsletterSignup = ({ lang, title, senderName, imageSrc, imageAlt = '' }: Props) => {
	const t = useTranslations('website-newsletter');
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { firstname: '', email: '' },
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const trimmedFirstName = values.firstname.trim();
		const subscription = {
			email: values.email,
			language: lang === 'de' ? 'de' : 'en',
			...(trimmedFirstName ? { firstname: trimmedFirstName } : {}),
		};

		try {
			const result = await subscribeToNewsletterAction(subscription);
			if (!result.success) {
				toast.error(t('popup.toast-failure'));

				return;
			}
			trackEvent('newsletter_signup_completed');
			toast.success(t('popup.toast-success'));
			form.reset();
		} catch {
			toast.error(t('popup.toast-failure'));
		}
	};

	const displayTitle = (title ?? t('popup.information-label')).trim();
	const displaySenderName = senderName?.trim() ?? '';

	return (
		<BlockWrapper marginTop="lg" marginBottom="lg">
			<div className="border-border bg-card shadow-card flex min-w-0 flex-col gap-8 rounded-3xl border p-6 md:gap-10 md:p-10">
				{displayTitle ? <h2 className="text-foreground text-3xl leading-9 font-medium">{displayTitle}</h2> : null}

				<div className="flex min-w-0 flex-col gap-8">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-end"
						>
							<FormField
								control={form.control}
								name="firstname"
								render={({ field }) => (
									<div className="min-w-0 flex-1">
										<FormItem>
											<FormLabel>{t('popup.first-name')}</FormLabel>
											<FormControl>
												<Input type="text" autoComplete="given-name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									</div>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<div className="min-w-0 flex-1">
										<FormItem>
											<FormLabel>{t('popup.email')}</FormLabel>
											<FormControl>
												<Input type="email" autoComplete="email" placeholder={t('popup.email-placeholder')} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									</div>
								)}
							/>
							<Button type="submit" size="md">
								{t('popup.button-subscribe')}
							</Button>
						</form>
					</Form>

					{displaySenderName || imageSrc ? (
						<div className="flex items-center gap-3">
							<div className="shadow-card size-[60px] shrink-0 overflow-hidden rounded-full border-2 border-white">
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
							{displaySenderName ? (
								<div className="text-foreground flex flex-col gap-1 text-base leading-6">
									<p>{t('popup.sent-by')}</p>
									<p className="font-medium">{displaySenderName}</p>
								</div>
							) : null}
						</div>
					) : null}
				</div>
			</div>
		</BlockWrapper>
	);
};
