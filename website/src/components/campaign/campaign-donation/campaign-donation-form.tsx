'use client';

import { Button } from '@/components/button/button';
import { useDonationFormState } from '@/components/donation-wizard/hooks/use-donation-form-state';
import { useDonationModal } from '@/components/donation-wizard/hooks/use-donation-modal';
import type { DonationAmountFieldsTranslations } from '@/components/donation-wizard/i18n/donation-amount-fields-translations';
import {
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_CUSTOM_AMOUNT_MIN,
	type PresetAmount,
} from '@/components/donation-wizard/utils/donation-amount';
import { getDonationWizardCardClass } from '@/components/donation-wizard/utils/donation-wizard-layout';
import { selectStep1FormView } from '@/components/donation-wizard/wizard/donation-machine-selectors';
import { Input } from '@/components/input/input';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import NextImage from 'next/image';

const ZEWO_HOMEPAGE_URL = 'https://www.zewo.ch';
const PROFILE_PICTURE_SIZE = 87;

const amountOptions: (PresetAmount | 'other')[] = [25, 50, 100, 'other'];

const segmentActive = 'bg-card shadow-xs';

type Props = {
	campaignId?: string;
	translations: DonationAmountFieldsTranslations;
	currency: WebsiteCurrency;
	quote: string;
	profilePictureSrc?: string | null;
	profilePictureAlt: string;
	zewoLabel: string;
};

export const CampaignDonationForm = ({
	campaignId,
	translations,
	currency,
	quote,
	profilePictureSrc,
	profilePictureAlt,
	zewoLabel,
}: Props) => {
	const { openWizardWithFormAmount } = useDonationModal();
	const form = useDonationFormState({ selectedAmount: 25 });
	const values = selectStep1FormView(form.context);
	const trimmedQuote = quote.trim();

	return (
		<div data-testid="donation-wizard-hero-form" className="w-full">
			<div
				className={cn(
					getDonationWizardCardClass('stepAmount'),
					'relative mx-0 flex max-w-none flex-col items-center gap-5 overflow-hidden px-9 pt-6 pb-9 lg:mx-auto lg:max-w-[400px]',
				)}
			>
				<a
					href={ZEWO_HOMEPAGE_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="absolute top-5 right-4"
					aria-label={zewoLabel}
				>
					<NextImage src="/assets/zewo.svg" alt="" width={38} height={37} className="size-[38px]" />
				</a>

				<div className="border-primary size-[87px] overflow-hidden rounded-full border-4 p-1">
					{profilePictureSrc ? (
						<NextImage
							src={profilePictureSrc}
							alt={profilePictureAlt}
							width={PROFILE_PICTURE_SIZE}
							height={PROFILE_PICTURE_SIZE}
							className="size-full rounded-full object-cover"
						/>
					) : (
						<div className="bg-muted size-full rounded-full" aria-hidden />
					)}
				</div>

				{trimmedQuote ? (
					<p className="text-foreground w-full min-w-0 text-center text-2xl leading-8 font-medium text-pretty break-words">
						“{trimmedQuote}”
					</p>
				) : null}

				<div className="bg-accent grid w-full grid-cols-2 rounded-md p-1">
					{(
						[
							{ cadence: 'monthly', label: translations.monthly, testId: 'donation-wizard-cadence-monthly' },
							{ cadence: 'one-time', label: translations.oneTime, testId: 'donation-wizard-cadence-one-time' },
						] as const
					).map(({ cadence, label, testId }) => (
						<button
							key={cadence}
							type="button"
							data-testid={testId}
							aria-pressed={values.cadence === cadence}
							onClick={() => form.setCadence(cadence)}
							className={cn(
								'cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors',
								values.cadence === cadence
									? cn(segmentActive, 'text-foreground')
									: 'text-muted-foreground hover:text-foreground',
							)}
						>
							{label}
						</button>
					))}
				</div>

				<div className="flex w-full gap-3">
					{amountOptions.map((option) => {
						const isSelected = option === values.selectedAmount;

						return (
							<button
								key={option}
								type="button"
								data-testid={`donation-wizard-preset-${option}`}
								aria-pressed={isSelected}
								onClick={() => form.setPresetAmount(option)}
								className={cn(
									'border-accent flex min-w-0 flex-1 items-center justify-center rounded-lg border p-2 transition-colors',
									isSelected ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted/50',
								)}
							>
								{option === 'other' ? (
									<span className="text-sm leading-none font-medium">{translations.other}</span>
								) : (
									<span className="flex flex-col items-center leading-none">
										<span className="text-[10px] font-medium">{currency}</span>
										<span className="text-lg font-medium">{option}</span>
									</span>
								)}
							</button>
						);
					})}
				</div>

				{values.selectedAmount === 'other' && (
					<Input
						type="number"
						data-testid="donation-wizard-custom-amount"
						min={DONATION_CUSTOM_AMOUNT_MIN}
						max={DONATION_CUSTOM_AMOUNT_MAX}
						placeholder={translations.customAmountPlaceholder}
						value={values.customAmount ?? ''}
						onChange={(e) => {
							const raw = e.target.value;
							if (raw === '') {
								form.setCustomAmount(null);

								return;
							}
							const parsed = parseFloat(raw);
							if (!isNaN(parsed) && parsed <= DONATION_CUSTOM_AMOUNT_MAX) {
								form.setCustomAmount(parsed);
							}
						}}
					/>
				)}

				<Button
					type="button"
					data-testid="donation-wizard-amount-continue"
					className="w-full"
					disabled={!values.isValid}
					onClick={() => {
						if (!form.isValid) {
							return;
						}

						openWizardWithFormAmount(campaignId ? { ...form.context, campaignId } : form.context);
					}}
				>
					{translations.donateNow}
				</Button>
			</div>
		</div>
	);
};
