'use client';

import { Input } from '@socialincome/design-system/forms/input/input';
import { Slider } from '@socialincome/design-system/forms/slider/slider';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { IndirectImpactNotice } from './indirect-impact-notice';

type Props = {
	amountOfRecipients: number;
	filteredRecipients: number;
	onChange: (value: number) => void;
};

const RECIPIENTS_MIN = 1;

const parseRecipientCountInput = (raw: string, max: number): number | null => {
	const trimmed = raw.trim();
	if (trimmed === '') {
		return null;
	}

	const parsed = Number(trimmed);
	if (!Number.isFinite(parsed)) {
		return null;
	}

	return Math.min(max, Math.max(RECIPIENTS_MIN, Math.round(parsed)));
};

export const RecipientsBox = ({ amountOfRecipients, filteredRecipients, onChange }: Props) => {
	const t = useTranslations('create-program-wizard');
	const [recipientCountDraft, setRecipientCountDraft] = useState<string | null>(null);
	const noCandidates = filteredRecipients === 0;
	const atMax = !noCandidates && amountOfRecipients === filteredRecipients;
	const recipientsLabel = t('step3.recipients.title');
	const recipientCountInput = noCandidates ? '0' : (recipientCountDraft ?? String(amountOfRecipients));

	const commitRecipientCount = (raw: string) => {
		setRecipientCountDraft(null);
		const parsed = parseRecipientCountInput(raw, filteredRecipients);
		if (parsed !== null && parsed !== amountOfRecipients) {
			onChange(parsed);
		}
	};

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-xl border">
			<div className="space-y-6 p-8">
				<h3 className="font-medium">{recipientsLabel}</h3>

				<div className="flex justify-center">
					<div className="border-input focus-within:border-ring focus-within:ring-ring/50 w-32 rounded-lg border px-5 py-2 text-center text-3xl tabular-nums focus-within:ring-[3px]">
						<Input
							variant="bare"
							type="number"
							inputMode="numeric"
							name="amountOfRecipients"
							autoComplete="off"
							min={RECIPIENTS_MIN}
							max={filteredRecipients}
							disabled={noCandidates}
							value={recipientCountInput}
							onChange={(event) => setRecipientCountDraft(event.target.value)}
							onBlur={(event) => commitRecipientCount(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.currentTarget.blur();
								}
							}}
							aria-label={recipientsLabel}
							data-testid="recipients-count-input"
						/>
					</div>
				</div>

				{noCandidates ? (
					<div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
						{t('step3.recipients.no_candidates')}
					</div>
				) : (
					<>
						<Slider
							data-testid="recipients-slider"
							min={RECIPIENTS_MIN}
							max={filteredRecipients}
							step={1}
							value={[amountOfRecipients]}
							onValueChange={([value]) => {
								setRecipientCountDraft(null);
								onChange(value);
							}}
							aria-label={recipientsLabel}
						/>

						<div className="text-muted-foreground flex justify-between text-xs">
							<span>{RECIPIENTS_MIN}</span>
							<span>{filteredRecipients}</span>
						</div>

						{atMax && <p className="text-muted-foreground text-center text-xs">{t('step3.recipients.max_hint')}</p>}
					</>
				)}
			</div>

			<div className="mt-auto">
				<IndirectImpactNotice recipients={noCandidates ? 0 : amountOfRecipients} />
			</div>
		</div>
	);
};
