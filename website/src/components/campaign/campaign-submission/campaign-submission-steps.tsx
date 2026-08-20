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

const FormCardLayout = ({ children }: { children: ReactNode }) => (
	<div className="bg-muted min-h-0 flex-1 overflow-y-auto px-6 py-10">
		<Card variant="noPadding" className="border-border mx-auto w-full max-w-[858px] rounded-xl border p-6 shadow-sm">
			{children}
		</Card>
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
				<FormCardLayout>
					<DetailsStep {...detailsStep} />
				</FormCardLayout>
			);
		case 'about':
			return (
				<FormCardLayout>
					<AboutStep {...aboutStep} />
				</FormCardLayout>
			);
	}
};
