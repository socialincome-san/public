'use client';

import { CountryFlag } from '@/components/country-flag';
import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { getCountryNameByCode } from '@/lib/types/country';
import type { ProgramCountryFeasibilityRow } from '@/modules/countries/country.types';
import { StatusCard } from '@socialincome/design-system/data-display/status-card/status-card';
import { RadioCardGroup } from '@socialincome/design-system/forms/radio-card/radio-card';
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
							<StatusCard
								key={row.id}
								inset="none"
								status={{ text: candidateAlertText, variant: hasCandidates ? 'confirm' : 'secondary' }}
							>
								<CountryRadioCard
									value={row.id}
									checked={selectedCountryId === row.id}
									label={
										<div className="flex items-center gap-2">
											<CountryFlag country={row.country.isoCode} size="lg" />
											<span className="text-foreground font-medium">{getCountryNameByCode(row.country.isoCode)}</span>
										</div>
									}
									programCount={row.stats.programCount}
									programLabel={t('step1.programs')}
									recipientCount={row.stats.recipientCount}
									recipientLabel={t('step1.recipients')}
								/>
							</StatusCard>
						);
					})}
				</RadioCardGroup>
			)}
		</div>
	);
};
