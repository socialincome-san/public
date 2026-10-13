'use client';

import { RecipientApproachType } from '@/components/create-program-wizard/wizard/types';
import { Profile } from '@/generated/prisma/enums';
import { cn } from '@socialincome/design-system/cn';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { RadioCard, RadioCardGroup } from '@socialincome/design-system/forms/radio-card/radio-card';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PillMultiSelect } from '@socialincome/design-system/forms/pill-multi-select/pill-multi-select';

type Props = {
	value: RecipientApproachType | null;
	targetFocuses: string[];
	focusOptions: { id: string; name: string }[];
	focusOptionsError?: string;
	targetProfiles: Profile[];
	targetLocalPartnerIds: string[];
	localPartnerOptions: { id: string; name: string }[];
	localPartnerOptionsError?: string;
	totalRecipients: number;
	filteredRecipients: number;
	isCountingRecipients: boolean;
	onChangeApproach: (value: RecipientApproachType) => void;
	onToggleFocus: (focus: string) => void;
	onToggleProfile: (profile: Profile) => void;
	onToggleLocalPartner: (localPartnerId: string) => void;
};


export const RecipientSelectionSection = ({
	value,
	targetFocuses,
	focusOptions,
	focusOptionsError,
	targetProfiles,
	targetLocalPartnerIds,
	localPartnerOptions,
	localPartnerOptionsError,
	totalRecipients,
	filteredRecipients,
	isCountingRecipients,
	onChangeApproach,
	onToggleFocus,
	onToggleProfile,
	onToggleLocalPartner,
}: Props) => {
	const t = useTranslations('create-program-wizard');
	const noUniversalRecipients = value === 'universal' && totalRecipients === 0;
	const noTargetedRecipients = value === 'targeted' && filteredRecipients === 0;

	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">{t('step2.recipient_selection.title')}</div>
			{focusOptionsError || localPartnerOptionsError ? (
				<div className="text-muted-foreground text-sm">
					{t('common.error')}: {focusOptionsError ?? localPartnerOptionsError}
				</div>
			) : null}

			<RadioCardGroup value={value ?? ''} onChange={(v) => onChangeApproach(v as RecipientApproachType)}>
				<RadioCard
					value="universal"
					checked={value === 'universal'}
					label={t('step2.recipient_selection.universal.label')}
					description={t('step2.recipient_selection.universal.description')}
					badge={<Badge variant="verified">{t('common.recommended')}</Badge>}
				>
					<div className={cn('text-sm', noUniversalRecipients ? 'text-destructive' : 'text-muted-foreground')}>
						{isCountingRecipients ? (
							<Loader2 className="inline-block h-4 w-4 animate-spin" aria-label="Loading" />
						) : (
							<>
								<span>
									<strong>{totalRecipients.toLocaleString()}</strong> {t('step2.recipient_selection.universal.available')}
								</span>

								{noUniversalRecipients && (
									<div className="mt-1 text-xs">{t('step2.recipient_selection.universal.empty_error')}</div>
								)}
							</>
						)}
					</div>
				</RadioCard>

				<RadioCard
					value="targeted"
					checked={value === 'targeted'}
					label={t('step2.recipient_selection.targeted.label')}
					description={t('step2.recipient_selection.targeted.description')}
				>
					<div className="space-y-4">
						<PillMultiSelect
							label={t('step2.recipient_selection.focuses')}
							items={focusOptions.map((focus) => ({ value: focus.id, label: focus.name }))}
							selectedValues={targetFocuses}
							onToggle={(selectedFocus) => onToggleFocus(selectedFocus)}
							removeLabel={t('common.remove')}
						/>

						<PillMultiSelect
							label={t('step2.recipient_selection.profiles')}
							items={Object.values(Profile).map((profile) => ({ value: profile, label: t(`step2.profiles.${profile}`) }))}
							selectedValues={targetProfiles}
							onToggle={(selectedProfile) => { const profile = Object.values(Profile).find((value) => value === selectedProfile); if (profile) onToggleProfile(profile); }}
							removeLabel={t('common.remove')}
						/>

						<PillMultiSelect
							label={t('step2.recipient_selection.local_partners')}
							items={localPartnerOptions.map((partner) => ({ value: partner.id, label: partner.name }))}
							selectedValues={targetLocalPartnerIds}
							onToggle={onToggleLocalPartner}
							removeLabel={t('common.remove')}
						/>

						<div className={cn('text-sm', noTargetedRecipients ? 'text-destructive' : 'text-muted-foreground')}>
							{isCountingRecipients ? (
								<Loader2 className="inline-block h-4 w-4 animate-spin" aria-label="Loading" />
							) : (
								<>
									<span>
										<strong>{filteredRecipients.toLocaleString()}</strong> of{' '}
										<strong>{totalRecipients.toLocaleString()}</strong> {t('step2.recipient_selection.targeted.matching')}
									</span>

									{noTargetedRecipients && (
										<div className="mt-1 text-xs">{t('step2.recipient_selection.targeted.empty_error')}</div>
									)}
								</>
							)}
						</div>
					</div>
				</RadioCard>
			</RadioCardGroup>
		</div>
	);
};
