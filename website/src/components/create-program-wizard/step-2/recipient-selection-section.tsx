'use client';

import type { CandidateSelectionApproach } from '@/components/candidate-selection/candidate-filters';
import { CandidateSelectionSection } from '@/components/candidate-selection/candidate-selection-section';
import { Profile } from '@/generated/prisma/enums';
import { useTranslations } from 'next-intl';

type Props = {
	value: CandidateSelectionApproach | null;
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
	onChangeApproach: (value: CandidateSelectionApproach) => void;
	onToggleFocus: (focus: string) => void;
	onToggleProfile: (profile: Profile) => void;
	onToggleLocalPartner: (localPartnerId: string) => void;
};

const isProfile = (value: string): value is Profile => Object.values<string>(Profile).includes(value);

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
	const profileLabel = (profile: string) => (isProfile(profile) ? t(`step2.profiles.${profile}`) : profile);

	return (
		<CandidateSelectionSection
			approach={value}
			focusItems={focusOptions.map((focus) => ({ value: focus.id, label: focus.name }))}
			selectedFocusIds={targetFocuses}
			profileItems={Object.values(Profile).map((profile) => ({ value: profile, label: profileLabel(profile) }))}
			selectedProfiles={targetProfiles}
			localPartnerItems={localPartnerOptions.map((partner) => ({ value: partner.id, label: partner.name }))}
			selectedLocalPartnerIds={targetLocalPartnerIds}
			isCounting={isCountingRecipients}
			isUniversalEmpty={value === 'universal' && totalRecipients === 0}
			isTargetedEmpty={value === 'targeted' && filteredRecipients === 0}
			optionsError={focusOptionsError ?? localPartnerOptionsError}
			labels={{
				title: t('step2.recipient_selection.title'),
				errorPrefix: t('common.error'),
				recommended: t('common.recommended'),
				universalLabel: t('step2.recipient_selection.universal.label'),
				universalDescription: t('step2.recipient_selection.universal.description'),
				targetedLabel: t('step2.recipient_selection.targeted.label'),
				targetedDescription: t('step2.recipient_selection.targeted.description'),
				focuses: t('step2.recipient_selection.focuses'),
				profiles: t('step2.recipient_selection.profiles'),
				localPartners: t('step2.recipient_selection.local_partners'),
				loading: t('step2.recipient_selection.loading'),
			}}
			universalCount={
				<span>
					<strong>{totalRecipients.toLocaleString()}</strong> {t('step2.recipient_selection.universal.available')}
				</span>
			}
			targetedCount={
				<span>
					<strong>{filteredRecipients.toLocaleString()}</strong> of <strong>{totalRecipients.toLocaleString()}</strong>{' '}
					{t('step2.recipient_selection.targeted.matching')}
				</span>
			}
			universalEmpty={t('step2.recipient_selection.universal.empty_error')}
			targetedEmpty={t('step2.recipient_selection.targeted.empty_error')}
			onChangeApproach={onChangeApproach}
			onToggleFocus={onToggleFocus}
			onToggleProfile={(profile) => {
				if (isProfile(profile)) {
					onToggleProfile(profile);
				}
			}}
			onToggleLocalPartner={onToggleLocalPartner}
		/>
	);
};
