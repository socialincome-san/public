import { cn } from '@/lib/utils/cn';
import type { ActiveDonationWizardStep } from '../wizard/get-active-wizard-step';

const COLUMN_NARROW = 'w-full min-w-0 md:w-[400px] md:shrink-0';
const COLUMN_FULL = 'w-full min-w-0';

const CARD_BASE = cn(
	'border-input bg-card rounded-3xl border shadow-[0_2px_4px_rgba(0,0,0,0.05)]',
	'px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-7',
);

const CARD_NARROW = cn(CARD_BASE, 'mx-auto w-full max-w-[400px]');
const CARD_FULL = cn(CARD_BASE, 'mx-0 w-full max-w-none');

/** Full-width column: payment method, Stripe checkout, QR bill. */
const FULL_WIDTH_COLUMN_STEPS = new Set<ActiveDonationWizardStep>(['stepPayment', 'stepStripeCheckout', 'stepQrBill']);

/** Narrow centered card: amount and plan steps in the split layout. */
const NARROW_CARD_STEPS = new Set<ActiveDonationWizardStep>(['stepAmount', 'stepPlanMonthly', 'stepPlanOneTime']);

type SidePanel = 'impact' | 'qr-hints';

const SIDE_PANEL_BY_STEP: Partial<Record<ActiveDonationWizardStep, SidePanel>> = {
	stepAmount: 'impact',
	stepPlanMonthly: 'impact',
	stepPlanOneTime: 'impact',
	stepQrContact: 'qr-hints',
};

export const getDonationWizardLayout = (step: ActiveDonationWizardStep | null) => {
	const sidePanel = step ? (SIDE_PANEL_BY_STEP[step] ?? null) : null;
	const isFullWidthColumn = step !== null && FULL_WIDTH_COLUMN_STEPS.has(step);
	const isNarrowCard = step !== null && NARROW_CARD_STEPS.has(step);

	return {
		columnClass: isFullWidthColumn ? COLUMN_FULL : COLUMN_NARROW,
		cardClass: isNarrowCard ? CARD_NARROW : CARD_FULL,
		showImpactPanel: sidePanel === 'impact',
		showQrHintsPanel: sidePanel === 'qr-hints',
	};
};

export const getDonationWizardCardClass = (step: ActiveDonationWizardStep) => getDonationWizardLayout(step).cardClass;

export const donationStepTitleRowClass = cn('mb-5 flex items-start justify-between gap-3');

export const donationImpactChecklistItemClass = cn('flex items-center justify-start gap-2 text-left text-sm font-medium');

export const donationImpactRowClass = cn('flex items-center justify-start gap-2 text-left text-sm font-medium');

export const donationImpactExplainerClass = cn('justify-start text-left');
