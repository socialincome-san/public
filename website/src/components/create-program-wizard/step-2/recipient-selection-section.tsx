'use client';

import { Badge } from '@/components/badge';
import { RecipientApproachType } from '@/components/create-program-wizard/wizard/types';
import { Profile } from '@/generated/prisma/enums';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { cn } from '@/lib/utils/cn';
import { SpinnerIcon } from '@socialincome/ui';
import { RadioCard } from '../radio-card';
import { RadioCardGroup } from '../radio-card-group';
import { PillMultiSelect } from './pill-multi-select';

type Props = {
	value: RecipientApproachType | null;
	targetFocuses: string[];
	focusOptions: { id: string; name: string }[];
	focusOptionsError?: string;
	targetProfiles: Profile[];
	totalRecipients: number;
	filteredRecipients: number;
	isCountingRecipients: boolean;
	onChangeApproach: (value: RecipientApproachType) => void;
	onToggleFocus: (focus: string) => void;
	onToggleProfile: (profile: Profile) => void;
};

export const RecipientSelectionSection = ({
	value,
	targetFocuses,
	focusOptions,
	focusOptionsError,
	targetProfiles,
	totalRecipients,
	filteredRecipients,
	isCountingRecipients,
	onChangeApproach,
	onToggleFocus,
	onToggleProfile,
}: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });
	const noUniversalRecipients = value === 'universal' && totalRecipients === 0;
	const noTargetedRecipients = value === 'targeted' && filteredRecipients === 0;
	const focusLabelById = Object.fromEntries(focusOptions.map((focus) => [focus.id, focus.name]));
	const focusLabel = (focusId: string) => focusLabelById[focusId] ?? focusId;
	const profileLabel = (profile: string) => t(`step2.profiles.${profile}`);

	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">{t('step2.recipient_selection.title')}</div>
			{focusOptionsError ? (
				<div className="text-muted-foreground text-sm">
					{t('common.error')}: {focusOptionsError}
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
							<SpinnerIcon />
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
							values={focusOptions.map((focus) => focus.id)}
							selected={targetFocuses}
							onToggle={(selectedFocus) => onToggleFocus(selectedFocus)}
							getLabel={focusLabel}
						/>

						<PillMultiSelect
							label={t('step2.recipient_selection.profiles')}
							values={Object.values(Profile)}
							selected={targetProfiles}
							onToggle={(selectedProfile) => onToggleProfile(selectedProfile as Profile)}
							getLabel={profileLabel}
						/>

						<div className={cn('text-sm', noTargetedRecipients ? 'text-destructive' : 'text-muted-foreground')}>
							{isCountingRecipients ? (
								<SpinnerIcon />
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

				<RadioCard
					value="custom"
					disabled
					label={t('step2.recipient_selection.custom.label')}
					description={t('step2.recipient_selection.custom.description')}
					badge={<Badge>{t('common.coming_soon')}</Badge>}
				/>
			</RadioCardGroup>
		</div>
	);
};
