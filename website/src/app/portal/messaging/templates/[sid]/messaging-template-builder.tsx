'use client';

import type { MessagingChannel } from '@/generated/prisma/client';
import type { MessagingRecipientType, SelectionState } from '@/lib/services/twilio/messaging/recipients.types';
import { emptySelection } from '@/lib/services/twilio/messaging/selection';
import type {
	ChannelPreviewSummary,
	ContentTemplateDetail,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-messaging.types';
import { useState } from 'react';
import type { RecipientsTableQuery } from './recipients-table';
import { emptyAssignments } from './variable-assignments';
import { Step1RecipientType } from './wizard/step-1-recipient-type';
import { Step2Recipients } from './wizard/step-2-recipients';
import { Step3Assignments } from './wizard/step-3-assignments';
import { Step4Summary } from './wizard/step-4-summary';
import { Step5Send } from './wizard/step-5-send';
import { WizardFooter } from './wizard/wizard-footer';
import { WizardStepIndicator } from './wizard/wizard-step-indicator';
import { canAdvanceFromStep, type WizardStep } from './wizard/wizard-validity';
import type { ResetReason } from './wizard/wizard.types';

type Props = {
	template: ContentTemplateDetail;
};

export const MessagingTemplateBuilder = ({ template }: Props) => {
	const [currentStep, setCurrentStep] = useState<WizardStep>(1);
	const [type, setType] = useState<MessagingRecipientType | null>(null);
	const [channel, setChannel] = useState<MessagingChannel | null>(null);
	const [query, setQuery] = useState<RecipientsTableQuery | null>(null);
	const [selection, setSelection] = useState<SelectionState>(emptySelection());
	const [lastResetReason, setLastResetReason] = useState<ResetReason>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [assignments, setAssignments] = useState<VariableAssignments>(emptyAssignments());
	const [sendOpen, setSendOpen] = useState(false);
	const [previewForSend, setPreviewForSend] = useState<ChannelPreviewSummary | null>(null);

	const handleTypeChange = (next: MessagingRecipientType | null) => {
		setType(next);
		setChannel(null);
		setQuery(next ? { type: next, page: 1, search: '' } : null);
		setSelection(emptySelection());
		setLastResetReason(null);
		setTotalCount(0);
		setAssignments(emptyAssignments());
		setPreviewForSend(null);
		setCurrentStep(1);
	};

	const canAdvance = canAdvanceFromStep(currentStep, {
		type,
		channel,
		selection,
		totalCount,
		variables: template.variables,
		assignments,
	});

	const handleBack = () => {
		if (currentStep > 1) {
			if (currentStep === 4) {
				setPreviewForSend(null);
			}
			setCurrentStep((currentStep - 1) as WizardStep);
		}
	};

	const handleNext = () => {
		if (currentStep < 4 && canAdvance) {
			setCurrentStep((currentStep + 1) as WizardStep);
		}
	};

	return (
		<div className="space-y-6">
			<WizardStepIndicator currentStep={currentStep} />

			{currentStep === 1 && (
				<Step1RecipientType type={type} channel={channel} onTypeChange={handleTypeChange} onChannelChange={setChannel} />
			)}

			{currentStep === 2 && query && (
				<Step2Recipients
					query={query}
					selection={selection}
					lastResetReason={lastResetReason}
					totalCount={totalCount}
					onQueryChange={setQuery}
					onSelectionChange={setSelection}
					onLastResetReasonChange={setLastResetReason}
					onTotalCountChange={setTotalCount}
				/>
			)}

			{currentStep === 3 && (
				<Step3Assignments variables={template.variables} type={type} assignments={assignments} onChange={setAssignments} />
			)}

			{currentStep === 4 && !sendOpen && (
				<Step4Summary
					body={template.body}
					variables={template.variables}
					assignments={assignments}
					selection={selection}
					totalCount={totalCount}
					type={type}
					channel={channel}
					onPreviewLoaded={setPreviewForSend}
				/>
			)}

			{currentStep === 4 && sendOpen && channel && type && previewForSend && (
				<Step5Send
					templateSid={template.sid}
					templateFriendlyName={template.friendlyName}
					channel={channel}
					recipientType={type}
					selection={selection}
					assignments={assignments}
					preview={previewForSend}
					onClose={() => setSendOpen(false)}
				/>
			)}

			{!sendOpen && (
				<WizardFooter
					currentStep={currentStep}
					canAdvance={canAdvance}
					canSend={previewForSend !== null}
					onBack={handleBack}
					onNext={handleNext}
					onSend={() => setSendOpen(true)}
				/>
			)}
		</div>
	);
};
