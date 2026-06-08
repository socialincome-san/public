import { cn } from '@/lib/utils/cn';

export const donationStepCardClass = cn(
	'border-border mx-auto w-full max-w-[400px] rounded-3xl border bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)]',
	'px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-7',
);

export const donationWizardStepColumnClass = 'w-full min-w-0 md:w-[400px] md:shrink-0';

export const donationPaymentStepCardClass = cn(donationStepCardClass, 'md:mx-0 md:max-w-none md:w-full');

export const donationStepTitleRowClass = cn(
	'mb-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
);

export const donationImpactChecklistItemClass = cn('flex items-center justify-start gap-2 text-left text-sm font-medium');

export const donationImpactRowClass = cn('flex items-center justify-start gap-2 text-left text-sm font-medium');

export const donationImpactExplainerClass = cn('justify-start text-left');
