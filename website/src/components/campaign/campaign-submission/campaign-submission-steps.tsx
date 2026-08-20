'use client';

import { Card } from '@/components/card/card';
import type { ReactNode } from 'react';
import { AboutStep } from './steps/about-step';
import { DetailsStep } from './steps/details-step';
import { ProgramStep } from './steps/program-step';
import type { AboutStepProps, CampaignSubmissionStepId, DetailsStepProps, ProgramStepProps } from './types';

type Props = {
	currentStep: CampaignSubmissionStepId;
	programStep: ProgramStepProps;
	detailsStep: DetailsStepProps;
	aboutStep: AboutStepProps;
};

const formCardClassName = 'border-border rounded-xl border p-6 shadow-sm';

const FormCardColumn = ({ children }: { children: ReactNode }) => (
	<div className="bg-muted min-h-0 flex-1 overflow-y-auto px-6 py-10">
		<div className="mx-auto flex w-full max-w-[858px] flex-col gap-6">{children}</div>
	</div>
);

export const CampaignSubmissionSteps = ({ currentStep, programStep, detailsStep, aboutStep }: Props) => {
	switch (currentStep) {
		case 'program':
			return (
				<div className="flex min-h-0 flex-1 flex-col">
					<ProgramStep {...programStep} />
				</div>
			);
		case 'details':
			return (
				<FormCardColumn>
					<Card variant="noPadding" className={formCardClassName}>
						<DetailsStep {...detailsStep} />
					</Card>
				</FormCardColumn>
			);
		case 'about':
			return (
				<FormCardColumn>
					<AboutStep {...aboutStep} />
				</FormCardColumn>
			);
	}
};
