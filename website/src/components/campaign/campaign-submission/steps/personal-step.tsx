'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input/input';
import { useEffect, useRef } from 'react';
import { CampaignSubmissionFormCard } from '../form-layout';
import { TurnstileWidget } from '../turnstile/turnstile-widget';
import type { PersonalStepProps } from '../types';

export const PersonalStep = ({
	form,
	labels,
	submitError,
	isSubmitting,
	lang,
	turnstileSiteKey,
	turnstileWidgetKey,
	onTurnstileTokenChange,
}: PersonalStepProps) => {
	const submitErrorRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (submitError) {
			submitErrorRef.current?.scrollIntoView({ block: 'nearest' });
			submitErrorRef.current?.focus();
		}
	}, [submitError]);

	return (
		<>
			<CampaignSubmissionFormCard>
				<div className="flex flex-col gap-6">
					<p className="text-muted-foreground text-sm">{labels.personalStepSubtitle}</p>

					<div className="grid gap-6 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{labels.firstName}</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="given-name" disabled={isSubmitting} />
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
									<FormLabel>{labels.lastName}</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="family-name" disabled={isSubmitting} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{labels.email}</FormLabel>
								<FormControl>
									<Input {...field} type="email" autoComplete="email" disabled={isSubmitting} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</CampaignSubmissionFormCard>

			{turnstileSiteKey ? (
				<TurnstileWidget
					key={turnstileWidgetKey}
					siteKey={turnstileSiteKey}
					language={lang}
					onTokenChange={onTurnstileTokenChange}
				/>
			) : null}

			{submitError ? (
				<p ref={submitErrorRef} className="text-destructive text-sm outline-none" role="alert" tabIndex={-1}>
					{submitError}
				</p>
			) : null}
		</>
	);
};
