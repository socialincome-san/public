'use client';

import { Input } from '@/components/input/input';
import { Slider } from '@/components/slider';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
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
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });
	const [recipientCountDraft, setRecipientCountDraft] = useState<string | null>(null);
	const noCandidates = filteredRecipients === 0;
	const atMax = !noCandidates && amountOfRecipients === filteredRecipients;
	const recipientsLabel = t('step3.recipients.title');
	const recipientCountInput = noCandidates ? '0' : (recipientCountDraft ?? String(amountOfRecipients));

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-xl border">
			<div className="space-y-6 p-8">
				<h3 className="font-medium">{recipientsLabel}</h3>

				<div className="flex justify-center">
					<Input
						type="number"
						inputMode="numeric"
						name="amountOfRecipients"
						autoComplete="off"
						min={RECIPIENTS_MIN}
						max={filteredRecipients}
						disabled={noCandidates}
						value={recipientCountInput}
						onChange={(event) => {
							const nextValue = event.target.value;
							setRecipientCountDraft(nextValue);
							const parsed = parseRecipientCountInput(nextValue, filteredRecipients);
							if (parsed !== null) {
								onChange(parsed);
							}
						}}
						onBlur={() => setRecipientCountDraft(null)}
						className="h-auto w-32 rounded-lg px-5 py-2 text-center text-3xl tabular-nums shadow-none"
						aria-label={recipientsLabel}
						data-testid="recipients-count-input"
					/>
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
