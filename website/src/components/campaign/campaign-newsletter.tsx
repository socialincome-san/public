'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { subscribeToNewsletterAction } from '@/lib/server-actions/newsletter-actions';
import { CreateNewsletterSubscription } from '@/lib/services/sendgrid/types';
import { LanguageCode } from '@/lib/types/language';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

type CampaignNewsletterTranslations = {
	title: string;
	emailLabel: string;
	emailPlaceholder: string;
	buttonAddSubscriber: string;
	toastSuccess: string;
	toastFailure: string;
};

const emailInputId = 'campaign-newsletter-email';

type Props = {
	lang: LanguageCode;
	translations: CampaignNewsletterTranslations;
};

export const CampaignNewsletter = ({ lang, translations }: Props) => {
	const formSchema = z.object({ email: z.string().email() });
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		const data: CreateNewsletterSubscription = {
			email: values.email,
			language: lang === 'de' ? 'de' : 'en',
		};

		try {
			await subscribeToNewsletterAction(data);
			toast.success(translations.toastSuccess);
			form.reset();
		} catch {
			toast.error(translations.toastFailure);
		}
	};

	return (
		<BlockWrapper className="my-8 md:my-12 lg:my-16">
			<div className="border-border bg-card rounded-2xl border px-4 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.05)] sm:px-5 sm:py-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
					<div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
						<div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
							<Mail className="size-4" strokeWidth={2} aria-hidden />
						</div>
						<p className="text-primary text-left text-base leading-snug font-semibold">{translations.title}</p>
					</div>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex w-full items-center sm:max-w-sm sm:shrink-0 lg:max-w-md"
						>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="w-full">
										<div className="border-input/80 bg-card flex w-full flex-col gap-1.5 rounded-xl border p-1.5 sm:flex-row sm:items-center sm:rounded-full">
											<label htmlFor={emailInputId} className="sr-only">
												{translations.emailLabel}
											</label>
											<FormControl>
												<Input
													id={emailInputId}
													type="email"
													autoComplete="email"
													placeholder={translations.emailPlaceholder}
													className="h-9 flex-1 rounded-lg border-0 bg-transparent shadow-none sm:rounded-full"
													{...field}
												/>
											</FormControl>
											<Button type="submit" size="sm" className="h-9 w-full shrink-0 sm:w-auto sm:rounded-full">
												{translations.buttonAddSubscriber}
											</Button>
										</div>
										<FormMessage className="text-destructive px-1 text-left text-xs" />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</div>
			</div>
		</BlockWrapper>
	);
};
