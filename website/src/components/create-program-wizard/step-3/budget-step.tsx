'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Slider } from '@/components/slider';
import { Switch } from '@/components/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs';

type PayoutInterval = 'monthly' | 'quarterly' | 'yearly';

type Props = {
	amountOfRecipients: number;
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
	customizePayouts: boolean;

	onRecipientsChange: (value: number) => void;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
	onCurrencyChange: (value: string) => void;
	onToggleCustomizePayouts: () => void;
};

function calculateTotalBudget(
	recipients: number,
	durationMonths: number,
	payoutPerInterval: number,
	interval: PayoutInterval,
) {
	const intervals =
		interval === 'monthly'
			? durationMonths
			: interval === 'quarterly'
				? Math.ceil(durationMonths / 3)
				: Math.ceil(durationMonths / 12);

	return recipients * payoutPerInterval * intervals;
}

function calculateMonthlyCost(recipients: number, payoutPerInterval: number, interval: PayoutInterval) {
	if (interval === 'monthly') return recipients * payoutPerInterval;
	if (interval === 'quarterly') return (recipients * payoutPerInterval) / 3;
	return (recipients * payoutPerInterval) / 12;
}

/* ----------------------------- Header ----------------------------- */

function ProgramCostsHeader({
	totalBudget,
	monthlyCost,
	currency,
	onCurrencyChange,
}: {
	totalBudget: number;
	monthlyCost: number;
	currency: string;
	onCurrencyChange: (value: string) => void;
}) {
	return (
		<div className="flex items-start justify-between">
			<div className="space-y-1">
				<p className="text-muted-foreground text-sm font-medium">Total program costs</p>

				<div className="flex items-end gap-4">
					<div className="flex items-baseline gap-2">
						<span className="text-muted-foreground text-sm font-semibold">{currency}</span>
						<span className="text-5xl font-semibold tabular-nums">{totalBudget.toLocaleString('de-CH')}</span>
					</div>

					<span className="text-muted-foreground pb-1 text-sm">
						{currency} {Math.round(monthlyCost).toLocaleString('de-CH')} / month
					</span>
				</div>
			</div>

			<Select value={currency} onValueChange={onCurrencyChange}>
				<SelectTrigger className="w-24">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="CHF">CHF</SelectItem>
					<SelectItem value="USD">USD</SelectItem>
					<SelectItem value="EUR">EUR</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

/* ---------------------- Recipients (left box) ---------------------- */

function IndirectImpactNotice({ recipients }: { recipients: number }) {
	const indirect = recipients * 5;

	return (
		<div className="flex items-center gap-3 rounded-b-xl bg-green-200/70 px-6 py-4 text-sm">
			<span className="text-lg">🎉</span>
			<p>
				<strong>{recipients} recipients</strong> benefit{' '}
				<strong
					className="cursor-help underline decoration-dotted underline-offset-4"
					title="On average, each supported recipient positively impacts around five additional people in their household and community."
				>
					{indirect.toLocaleString('de-CH')} additional indirect people
				</strong>{' '}
				in poverty.
			</p>
		</div>
	);
}

function RecipientsBox({ value, onChange }: { value: number; onChange: (value: number) => void }) {
	return (
		<div className="flex h-full flex-col overflow-hidden rounded-xl border">
			<div className="space-y-6 p-8">
				<h3 className="font-medium">Recipients for program start</h3>

				<div className="flex justify-center">
					<div className="rounded-lg border px-5 py-2 text-3xl font-semibold tabular-nums">{value}</div>
				</div>

				<Slider min={10} max={1540} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />

				<div className="text-muted-foreground flex justify-between text-xs">
					<span>10</span>
					<span>1’540</span>
				</div>
			</div>

			{/* 👇 THIS keeps the green box pinned to the bottom */}
			<div className="mt-auto">
				<IndirectImpactNotice recipients={value} />
			</div>
		</div>
	);
}

/* ----------------------- Payouts (right box) ----------------------- */

function PayoutSummary({
	programDuration,
	payoutPerInterval,
	payoutInterval,
	currency,
}: {
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
}) {
	return (
		<div className="divide-y text-sm">
			<div className="flex justify-between py-3">
				<span>Program duration</span>
				<span className="font-medium">{programDuration} months</span>
			</div>

			<div className="flex justify-between py-3">
				<span>Payout per interval</span>
				<span className="font-medium">
					{currency} {payoutPerInterval}
				</span>
			</div>

			<div className="flex justify-between py-3">
				<span>Schedule</span>
				<span className="font-medium capitalize">{payoutInterval}</span>
			</div>
		</div>
	);
}

function PayoutControls({
	programDuration,
	payoutPerInterval,
	payoutInterval,
	currency,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
}: {
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
}) {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<div className="flex justify-between text-sm font-medium">
					<span>Program duration</span>
					<span>{programDuration} months</span>
				</div>

				<Slider min={6} max={60} step={1} value={[programDuration]} onValueChange={([v]) => onDurationChange(v)} />
			</div>

			<div className="space-y-2">
				<div className="flex justify-between text-sm font-medium">
					<span>Payout per interval</span>
					<span>
						{currency} {payoutPerInterval}
					</span>
				</div>

				<Slider min={5} max={100} step={1} value={[payoutPerInterval]} onValueChange={([v]) => onPayoutChange(v)} />
			</div>

			<div className="space-y-2">
				<p className="text-sm font-medium">Payment interval</p>

				<Tabs value={payoutInterval} onValueChange={(v) => onIntervalChange(v as PayoutInterval)}>
					<TabsList className="grid w-fit grid-cols-3">
						<TabsTrigger value="monthly">Monthly</TabsTrigger>
						<TabsTrigger value="quarterly">Quarterly</TabsTrigger>
						<TabsTrigger value="yearly">Yearly</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
		</div>
	);
}

function PayoutBox({
	programDuration,
	payoutPerInterval,
	payoutInterval,
	currency,
	customizePayouts,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
	onToggleCustomizePayouts,
}: {
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
	customizePayouts: boolean;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
	onToggleCustomizePayouts: () => void;
}) {
	return (
		<div className="flex h-full flex-col rounded-xl border p-8">
			<h3 className="font-medium">Payouts</h3>

			<div className="mt-6">
				{customizePayouts ? (
					<PayoutControls
						programDuration={programDuration}
						payoutPerInterval={payoutPerInterval}
						payoutInterval={payoutInterval}
						currency={currency}
						onDurationChange={onDurationChange}
						onPayoutChange={onPayoutChange}
						onIntervalChange={onIntervalChange}
					/>
				) : (
					<PayoutSummary
						programDuration={programDuration}
						payoutPerInterval={payoutPerInterval}
						payoutInterval={payoutInterval}
						currency={currency}
					/>
				)}
			</div>

			<div className="flex items-center gap-3 pt-6">
				<Switch checked={customizePayouts} onCheckedChange={onToggleCustomizePayouts} />
				<span className="text-sm font-medium">Customize</span>
			</div>
		</div>
	);
}

/* ----------------------------- Step ----------------------------- */

export function BudgetStep({
	amountOfRecipients,
	programDuration,
	payoutPerInterval,
	payoutInterval,
	currency,
	customizePayouts,
	onRecipientsChange,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
	onCurrencyChange,
	onToggleCustomizePayouts,
}: Props) {
	const totalBudget = calculateTotalBudget(amountOfRecipients, programDuration, payoutPerInterval, payoutInterval);

	const monthlyCost = calculateMonthlyCost(amountOfRecipients, payoutPerInterval, payoutInterval);

	return (
		<div className="space-y-8">
			<ProgramCostsHeader
				totalBudget={totalBudget}
				monthlyCost={monthlyCost}
				currency={currency}
				onCurrencyChange={onCurrencyChange}
			/>

			<div className="grid gap-6 md:grid-cols-2">
				<RecipientsBox value={amountOfRecipients} onChange={onRecipientsChange} />

				<PayoutBox
					programDuration={programDuration}
					payoutPerInterval={payoutPerInterval}
					payoutInterval={payoutInterval}
					currency={currency}
					customizePayouts={customizePayouts}
					onDurationChange={onDurationChange}
					onPayoutChange={onPayoutChange}
					onIntervalChange={onIntervalChange}
					onToggleCustomizePayouts={onToggleCustomizePayouts}
				/>
			</div>
		</div>
	);
}
