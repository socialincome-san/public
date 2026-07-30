'use client';

import { Button } from '@/components/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { campaignSubmissionDefaultCurrency } from '@/lib/services/campaign/campaign-submission-input';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import { cn } from '@/lib/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type SubmissionLabels = {
	title: string;
	description: string;
	goal: string;
	currency: string;
	endDate: string;
	program: string;
	primaryImage: string;
	submit: string;
	submitting: string;
	success: string;
	error: string;
	programPlaceholder: string;
	currencyPlaceholder: string;
	imageHint: string;
};

type Props = {
	labels: SubmissionLabels;
	onSuccess?: () => void;
};

const formSchema = z.object({
	title: z.string().trim().min(1).max(campaignSubmissionConfig.maxTitleLength),
	description: z.string().trim().min(1).max(campaignSubmissionConfig.maxDescriptionLength),
	goal: z.coerce.number().positive(),
	currency: z.enum(campaignSubmissionConfig.allowedCurrencies),
	endDate: z.string().min(1),
	programId: z.string().trim().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export const CampaignSubmissionForm = ({ labels, onSuccess }: Props) => {
	const [programs, setPrograms] = useState<PublicSubmissionProgramOption[]>([]);
	const [programsError, setProgramsError] = useState<string | null>(null);
	const [primaryImage, setPrimaryImage] = useState<File | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			description: '',
			goal: undefined,
			currency: campaignSubmissionDefaultCurrency,
			endDate: '',
			programId: '',
		},
	});

	useEffect(() => {
		const loadPrograms = async () => {
			try {
				const response = await fetch('/api/campaign-submissions/programs');
				if (!response.ok) {
					setProgramsError(labels.error);

					return;
				}

				const data = (await response.json()) as { programs: PublicSubmissionProgramOption[] };
				setPrograms(data.programs);
			} catch {
				setProgramsError(labels.error);
			}
		};

		void loadPrograms();
	}, [labels.error]);

	const onSubmit = async (values: FormValues) => {
		setSubmitError(null);
		setImageError(null);
		setSubmitSuccess(false);

		if (!primaryImage) {
			setImageError(labels.primaryImage);

			return;
		}

		setIsSubmitting(true);

		try {
			const formData = new FormData();
			formData.append('title', values.title);
			formData.append('description', values.description);
			formData.append('goal', String(values.goal));
			formData.append('currency', values.currency);
			formData.append('endDate', values.endDate);
			formData.append('programId', values.programId);
			formData.append('primaryImage', primaryImage);

			const response = await fetch('/api/campaign-submissions', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { error?: string } | null;
				setSubmitError(payload?.error ?? labels.error);

				return;
			}

			setSubmitSuccess(true);
			form.reset({
				title: '',
				description: '',
				goal: undefined,
				currency: campaignSubmissionDefaultCurrency,
				endDate: '',
				programId: '',
			});
			setPrimaryImage(null);
			onSuccess?.();
		} catch {
			setSubmitError(labels.error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitSuccess) {
		return <p className="text-foreground text-sm">{labels.success}</p>;
	}

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{labels.title}</FormLabel>
							<FormControl>
								<Input {...field} autoComplete="off" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{labels.description}</FormLabel>
							<FormControl>
								<textarea
									{...field}
									rows={4}
									className={cn(
										'placeholder:text-muted-foreground border-border text-foreground w-full min-w-0 rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden',
										'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
									)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="goal"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{labels.goal}</FormLabel>
								<FormControl>
									<Input {...field} type="number" min={1} step="0.01" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="currency"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{labels.currency}</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder={labels.currencyPlaceholder} />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{campaignSubmissionConfig.allowedCurrencies.map((currency) => (
											<SelectItem key={currency} value={currency}>
												{currency}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<FormField
					control={form.control}
					name="endDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{labels.endDate}</FormLabel>
							<FormControl>
								<Input {...field} type="date" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="programId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{labels.program}</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={labels.programPlaceholder} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{programs.map((program) => (
										<SelectItem key={program.id} value={program.id}>
											{program.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{programsError ? <p className="text-destructive text-sm">{programsError}</p> : null}
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col gap-2">
					<Label htmlFor="campaign-primary-image">{labels.primaryImage}</Label>
					<Input
						id="campaign-primary-image"
						type="file"
						accept={campaignSubmissionConfig.permittedImageMimeTypes.join(',')}
						onChange={(event) => {
							setImageError(null);
							setPrimaryImage(event.target.files?.[0] ?? null);
						}}
					/>
					<p className="text-muted-foreground text-xs">{labels.imageHint}</p>
					{imageError ? <p className="text-destructive text-sm">{imageError}</p> : null}
				</div>
				{submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
				<Button type="submit" disabled={isSubmitting || Boolean(programsError)}>
					{isSubmitting ? labels.submitting : labels.submit}
				</Button>
			</form>
		</Form>
	);
};

export type { SubmissionLabels };
