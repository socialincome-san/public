'use client';

import type { CandidateSelectionApproach } from '@/components/candidate-selection/candidate-filters';
import { cn } from '@socialincome/design-system/cn';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import {
	PillMultiSelect,
	type PillMultiSelectItem,
} from '@socialincome/design-system/forms/pill-multi-select/pill-multi-select';
import { RadioCard, RadioCardGroup } from '@socialincome/design-system/forms/radio-card/radio-card';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
	approach: CandidateSelectionApproach | null;
	focusItems: PillMultiSelectItem[];
	selectedFocusIds: string[];
	profileItems: PillMultiSelectItem[];
	selectedProfiles: string[];
	localPartnerItems: PillMultiSelectItem[];
	selectedLocalPartnerIds: string[];
	isCounting: boolean;
	isUniversalEmpty: boolean;
	isTargetedEmpty: boolean;
	optionsError?: string;
	labels: {
		title: string;
		errorPrefix: string;
		recommended: string;
		universalLabel: string;
		universalDescription: string;
		targetedLabel: string;
		targetedDescription: string;
		focuses: string;
		profiles: string;
		localPartners: string;
		loading: string;
	};
	universalCount: ReactNode;
	targetedCount: ReactNode;
	universalEmpty: ReactNode;
	targetedEmpty: ReactNode;
	onChangeApproach: (value: CandidateSelectionApproach) => void;
	onToggleFocus: (value: string) => void;
	onToggleProfile: (value: string) => void;
	onToggleLocalPartner: (value: string) => void;
};

const isApproach = (value: string): value is CandidateSelectionApproach => value === 'universal' || value === 'targeted';

export const CandidateSelectionSection = ({
	approach,
	focusItems,
	selectedFocusIds,
	profileItems,
	selectedProfiles,
	localPartnerItems,
	selectedLocalPartnerIds,
	isCounting,
	isUniversalEmpty,
	isTargetedEmpty,
	optionsError,
	labels,
	universalCount,
	targetedCount,
	universalEmpty,
	targetedEmpty,
	onChangeApproach,
	onToggleFocus,
	onToggleProfile,
	onToggleLocalPartner,
}: Props) => (
	<div className="space-y-4">
		<div className="text-lg font-medium">{labels.title}</div>
		{optionsError ? (
			<div className="text-muted-foreground text-sm">
				{labels.errorPrefix}: {optionsError}
			</div>
		) : null}

		<RadioCardGroup
			value={approach ?? ''}
			onChange={(value) => {
				if (isApproach(value)) {
					onChangeApproach(value);
				}
			}}
		>
			<RadioCard
				value="universal"
				checked={approach === 'universal'}
				label={labels.universalLabel}
				description={labels.universalDescription}
				badge={<Badge variant="verified">{labels.recommended}</Badge>}
			>
				<CountSummary
					isCounting={isCounting}
					isEmpty={isUniversalEmpty}
					loadingLabel={labels.loading}
					empty={universalEmpty}
				>
					{universalCount}
				</CountSummary>
			</RadioCard>

			<RadioCard
				value="targeted"
				checked={approach === 'targeted'}
				label={labels.targetedLabel}
				description={labels.targetedDescription}
			>
				<div className="space-y-4">
					<PillMultiSelect
						label={labels.focuses}
						items={focusItems}
						selectedValues={selectedFocusIds}
						onToggle={onToggleFocus}
					/>
					<PillMultiSelect
						label={labels.profiles}
						items={profileItems}
						selectedValues={selectedProfiles}
						onToggle={onToggleProfile}
					/>
					<PillMultiSelect
						label={labels.localPartners}
						items={localPartnerItems}
						selectedValues={selectedLocalPartnerIds}
						onToggle={onToggleLocalPartner}
					/>
					<CountSummary
						isCounting={isCounting}
						isEmpty={isTargetedEmpty}
						loadingLabel={labels.loading}
						empty={targetedEmpty}
					>
						{targetedCount}
					</CountSummary>
				</div>
			</RadioCard>
		</RadioCardGroup>
	</div>
);

const CountSummary = ({
	isCounting,
	isEmpty,
	loadingLabel,
	empty,
	children,
}: {
	isCounting: boolean;
	isEmpty: boolean;
	loadingLabel: string;
	empty: ReactNode;
	children: ReactNode;
}) => (
	<div className={cn('text-sm', isEmpty ? 'text-destructive' : 'text-muted-foreground')}>
		{isCounting ? (
			<Loader2 className="inline-block h-4 w-4 animate-spin" aria-label={loadingLabel} />
		) : (
			<>
				{children}
				{isEmpty ? <div className="mt-1 text-xs">{empty}</div> : null}
			</>
		)}
	</div>
);
