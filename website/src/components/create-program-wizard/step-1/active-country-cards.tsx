'use client';

import { CardAlertFooter } from '@/components/card-alert-footer';
import { CountryFlag } from '@/components/country-flag';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { getCountryNameByCode } from '@/lib/types/country';
import { cn } from '@/lib/utils/cn';
import { RadioCardGroup } from '../radio-card-group';
import { CountryRadioCard } from './country-radio-card';

type Props = {
	rows: ProgramCountryFeasibilityRow[];
	selectedCountryId: string | null;
	onSelectCountry: (id: string) => void;
};

export const ActiveCountryCards = ({ rows, selectedCountryId, onSelectCountry }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="space-y-3">
			<p className="text-sm font-medium">{t('step1.choose_country')}</p>

			{rows.length > 0 && (
				<RadioCardGroup value={selectedCountryId ?? ''} onChange={onSelectCountry} layout="grid">
					{rows.map((row) => {
						const candidatesCount = row.stats.candidateCount;
						const hasCandidates = candidatesCount > 0;
						const candidateAlertText = hasCandidates
							? t(
									candidatesCount === 1 ? 'step1.candidates_ready_to_enroll_one' : 'step1.candidates_ready_to_enroll_other',
									{
										count: candidatesCount,
									},
								)
							: t('step1.no_candidates');

						return (
							<div
								key={row.id}
								className={cn(
									'flex h-full flex-col rounded-2xl drop-shadow-md',
									hasCandidates ? 'bg-confirm-foreground' : 'bg-secondary',
								)}
							>
								<CountryRadioCard
									value={row.id}
									checked={selectedCountryId === row.id}
									label={
										<div className="flex items-center gap-2">
											<CountryFlag country={row.country.isoCode} size="lg" />
											<span className="font-medium text-cyan-950">{getCountryNameByCode(row.country.isoCode)}</span>
										</div>
									}
									programCount={row.stats.programCount}
									programLabel={t('step1.programs')}
									recipientCount={row.stats.recipientCount}
									recipientLabel={t('step1.recipients')}
								/>
								<CardAlertFooter text={candidateAlertText} variant={hasCandidates ? 'confirm' : 'secondary'} />
							</div>
						);
					})}
				</RadioCardGroup>
			)}
		</div>
	);
};
