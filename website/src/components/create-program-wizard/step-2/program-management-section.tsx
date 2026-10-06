'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { RadioCard, RadioCardGroup } from '@socialincome/design-system/forms/radio-card/radio-card';
import type { ProgramManagementType } from '../wizard/types';

type Props = {
	value: ProgramManagementType | null;
	onChange: (value: ProgramManagementType) => void;
};

export const ProgramManagementSection = ({ value, onChange }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">{t('step2.program_management.title')}</div>

			<RadioCardGroup value={value ?? ''} layout="grid" onChange={(v) => onChange(v as ProgramManagementType)}>
				<RadioCard
					value="social_income"
					checked={value === 'social_income'}
					label={t('step2.program_management.social_income.label')}
					description={t('step2.program_management.social_income.description')}
				/>

				<RadioCard
					value="self_run"
					disabled
					label={t('step2.program_management.self_run.label')}
					description={t('step2.program_management.self_run.description')}
					badge={<Badge>{t('common.coming_soon')}</Badge>}
				/>
			</RadioCardGroup>
		</div>
	);
};
