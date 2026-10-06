'use client';

import { useTranslator } from '@/lib/i18n/use-translator';
import type { LanguageCode } from '@/lib/types/language';
import { subscribeToNewsletterAction } from '@/modules/newsletter/newsletter.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@socialincome/design-system/button/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@socialincome/design-system/form/form';
import { Input } from '@socialincome/design-system/input/input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

type Props = {
	lang: LanguageCode;
};

const formSchema = z.object({ email: z.string().email() });

export const NewsletterSignup = ({ lang }: Props) => {
	const translator = useTranslator(lang, 'website-newsletter');
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	if (!translator) {
		return null;
	}

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const subscription = {
			email: values.email,
			language: lang === 'de' ? 'de' : 'en',
		};

		try {
			await subscribeToNewsletterAction(subscription);
			toast.success(translator.t('popup.toast-success'));
			form.reset();
		} catch {
			toast.error(translator.t('popup.toast-failure'));
		}
	};

	return (
		<div className="bg-card border-border w-site-width max-w-content mx-auto my-10 rounded-2xl border p-6 md:p-8">
			<h3 className="text-foreground mb-6 text-center text-2xl font-bold">{translator.t('popup.information-label')}</h3>
			<Form {...form}>
				<form className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<div className="flex-1">
								<FormItem>
									<FormControl>
										<Input
											type="email"
											autoComplete="email"
											placeholder={translator.t('popup.email-placeholder')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</div>
						)}
					/>
					<Button type="submit" size="md">
						{translator.t('popup.button-subscribe')}
					</Button>
				</form>
			</Form>
		</div>
	);
};
