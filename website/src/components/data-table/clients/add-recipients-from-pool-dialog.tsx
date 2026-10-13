'use client';

import { Profile } from '@/generated/prisma/enums';
import {
	assignProgramRecipientsFromPoolAction,
	getProgramCandidatePoolSetupAction,
	previewProgramRecipientAssignmentAction,
} from '@/modules/programs/program.actions';
import type { ProgramCandidatePoolPreview, ProgramCandidatePoolSetup } from '@/modules/programs/program.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { PillMultiSelect } from '@socialincome/design-system/forms/pill-multi-select/pill-multi-select';
import { Input } from '@socialincome/design-system/forms/input/input';
import { Slider } from '@socialincome/design-system/forms/slider/slider';
import { StepIndicator } from '@socialincome/design-system/navigation/step-indicator/step-indicator';
import { WizardFooter } from '@socialincome/design-system/navigation/wizard-footer/wizard-footer';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Props = {
	programId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: (count: number) => void;
};

type Filters = {
	focuses: string[];
	profiles: Profile[];
	localPartnerIds: string[];
};

const emptyFilters = (): Filters => ({ focuses: [], profiles: [], localPartnerIds: [] });
const toggle = <T extends string>(values: T[], value: T): T[] =>
	values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export const AddRecipientsFromPoolDialog = ({ programId, open, onOpenChange, onSuccess }: Props) => {
	const t = useTranslations('recipient-pool');
	const router = useRouter();
	const [setup, setSetup] = useState<ProgramCandidatePoolSetup | null>(null);
	const [filters, setFilters] = useState<Filters>(emptyFilters);
	const [mode, setMode] = useState<'all' | 'targeted'>('all');
	const [step, setStep] = useState<1 | 2>(1);
	const [quantity, setQuantity] = useState(1);
	const [draft, setDraft] = useState<string | null>(null);
	const [preview, setPreview] = useState<ProgramCandidatePoolPreview | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const requestId = useRef(0);
	const isSubmitting = useRef(false);

	const activeFilters = mode === 'all' ? emptyFilters() : filters;
	const matching = preview?.matchingAvailable ?? 0;
	const selectedQuantity = matching > 0 ? Math.min(Math.max(quantity, 1), matching) : 0;

	useEffect(() => {
		if (!open) {
			requestId.current++;
			setSetup(null);
			setPreview(null);
			setFilters(emptyFilters());
			setMode('all');
			setStep(1);
			setQuantity(1);
			setError(null);
			setDraft(null);
			return;
		}
		const token = ++requestId.current;
		setLoading(true);
		void getProgramCandidatePoolSetupAction(programId).then((result) => {
			if (token !== requestId.current) return;
			setLoading(false);
			if (result.success) setSetup(result.data);
			else setError(t('error'));
		}).catch(() => {
			if (token === requestId.current) { setLoading(false); setError(t('error')); }
		});
	}, [open, programId, t]);

	useEffect(() => {
		if (!open || !setup) return;
		const token = ++requestId.current;
		setLoading(true);
		setPreview(null);
		void previewProgramRecipientAssignmentAction({
			programId,
			...activeFilters,
			amountOfRecipients: selectedQuantity || quantity,
		}).then((result) => {
			if (token !== requestId.current) return;
			setLoading(false);
			if (!result.success) { setError(t('error')); return; }
			setPreview(result.data);
			setQuantity((current) => Math.min(current, Math.max(1, result.data.matchingAvailable)));
			setError(null);
		}).catch(() => {
			if (token === requestId.current) { setLoading(false); setError(t('error')); }
		});
	// Primitive and array filter changes trigger fresh server-side previews.
	}, [open, setup, programId, mode, filters, quantity, t]);

	const updateFilters = (next: Filters) => { setFilters(next); setError(null); };
	const setCount = (value: number) => {
		if (!Number.isFinite(value) || matching < 1) return;
		setQuantity(Math.max(1, Math.min(matching, Math.round(value))));
		setDraft(null);
	};
	const close = () => { if (!saving) onOpenChange(false); };
	const submit = async () => {
		if (isSubmitting.current || !setup || !preview || selectedQuantity < 1 || loading) return;
		isSubmitting.current = true;
		setSaving(true);
		setError(null);
		try {
			const result = await assignProgramRecipientsFromPoolAction({
				programId,
				...activeFilters,
				amountOfRecipients: selectedQuantity,
			});
			if (!result.success) { setError(t('error')); return; }
			onSuccess(result.data.assigned);
			router.refresh();
			onOpenChange(false);
		} catch {
			setError(t('error'));
		} finally {
			setSaving(false);
			isSubmitting.current = false;
		}
	};

	return (
		<Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
			<DialogContent size="md" closeOnClickOutside={!saving} closeOnEscape={!saving} hideCloseButton={saving} closeLabel={t('close')}>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
					<StepIndicator activeIndex={step - 1} variant="dots" ariaLabel={t('steps')} steps={[{ label: t('selection') }, { label: t('preview') }]} />
				</DialogHeader>
				<DialogBody>
					{error ? <p role="alert" className="text-destructive text-sm">{error}</p> : null}
					{!setup ? <p role="status">{loading ? t('loading') : t('error')}</p> : step === 1 ? (
						<div className="space-y-5">
							<p className="text-sm font-medium">{t('country')}: {setup.countryCode}</p>
							<p className="text-muted-foreground text-sm">{t('available', { count: setup.totalAvailable })}</p>
							<div className="flex flex-wrap gap-2">
								<Button variant={mode === 'all' ? 'default' : 'outline'} onClick={() => setMode('all')}>{t('all')}</Button>
								<Button variant={mode === 'targeted' ? 'default' : 'outline'} onClick={() => setMode('targeted')}>{t('targeted')}</Button>
							</div>
							{mode === 'targeted' ? (
								<>
									<PillMultiSelect label={t('focuses')} items={setup.focusOptions.map((item) => ({ value: item.id, label: item.name }))} selectedValues={filters.focuses} onToggle={(value) => updateFilters({ ...filters, focuses: toggle(filters.focuses, value) })} removeLabel={t('remove')} />
									<PillMultiSelect label={t('profiles')} items={Object.values(Profile).map((value) => ({ value, label: t(value) }))} selectedValues={filters.profiles} onToggle={(value) => { const profile = Object.values(Profile).find((item) => item === value); if (profile) updateFilters({ ...filters, profiles: toggle(filters.profiles, profile) }); }} removeLabel={t('remove')} />
									<PillMultiSelect label={t('partners')} items={setup.localPartnerOptions.map((item) => ({ value: item.id, label: item.name }))} selectedValues={filters.localPartnerIds} onToggle={(value) => updateFilters({ ...filters, localPartnerIds: toggle(filters.localPartnerIds, value) })} removeLabel={t('remove')} />
								</>
							) : null}
							<p aria-live="polite">{loading ? t('loading') : t('matching', { count: matching })}</p>
							{!loading && matching === 0 ? <p role="status" className="text-muted-foreground text-sm">{t('empty')}</p> : null}
						</div>
					) : (
						<div className="space-y-5">
							<label htmlFor="pool-quantity" className="text-sm font-medium">{t('quantity')}</label>
							<Input id="pool-quantity" type="number" min={1} max={matching} disabled={saving || loading} value={draft ?? String(selectedQuantity)} onChange={(event) => setDraft(event.target.value)} onBlur={(event) => { setCount(Number(event.target.value)); }} />
							<Slider min={1} max={Math.max(1, matching)} value={[selectedQuantity || 1]} step={1} disabled={saving || loading || matching < 1} onValueChange={([value]) => setCount(value)} aria-label={t('quantity')} />
							<dl className="space-y-3 text-sm">
								<div className="flex justify-between"><dt>{t('duration')}</dt><dd>{t('months', { count: setup.programDurationInMonths })}</dd></div>
								<div className="flex justify-between"><dt>{t('amount')}</dt><dd>{setup.payoutPerInterval} {setup.payoutCurrency}</dd></div>
								<div className="flex justify-between"><dt>{t('interval')}</dt><dd>{t(setup.payoutInterval)}</dd></div>
								<div className="flex justify-between font-medium"><dt>{t('cost')}</dt><dd>{loading ? t('loading') : `${preview?.budget.calculatedTotalBudget.toLocaleString() ?? '—'} ${setup.payoutCurrency}`}</dd></div>
							</dl>
						</div>
					)}
				</DialogBody>
				<WizardFooter
					back={<Button variant="outline" disabled={saving} onClick={() => step === 2 ? setStep(1) : close()}>{step === 2 ? t('back') : t('close')}</Button>}
					primary={step === 1
						? <Button disabled={loading || !preview || matching < 1 || saving} onClick={() => setStep(2)}>{t('continue')}</Button>
						: <Button disabled={saving || loading || !preview || selectedQuantity < 1} onClick={() => { void submit(); }}>{saving ? t('saving') : t('add', { count: selectedQuantity })}</Button>}
				/>
			</DialogContent>
		</Dialog>
	);
};
