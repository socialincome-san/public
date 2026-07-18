'use client';

import { DialogTitle } from '@/components/dialog';
import type { MessagingChannel } from '@/generated/prisma/client';
import type { ChannelPreviewSummary } from '@/lib/services/twilio/messaging/dispatch/dispatch.types';
import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients/recipients.types';
import { emptySelection } from '@/lib/services/twilio/messaging/recipients/selection';
import type { SelectionState } from '@/lib/services/twilio/messaging/recipients/selection.types';
import type {
	TwilioTemplateDetail,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';
import { cn } from '@/lib/utils/cn';
import { useEffect, useState } from 'react';
import type { RecipientsTableQuery } from './recipients-table';
import { SendProgress } from './send-progress';
import { Step1RecipientType } from './step-1-recipient-type';
import { Step2Recipients } from './step-2-recipients';
import { Step3Assignments } from './step-3-assignments';
import { Step4Summary } from './step-4-summary';
import type { ResetReason } from './types';
import { useMessagingSend } from './use-messaging-send';
import { canAdvanceFromStep, type WizardStep } from './validity';
import { emptyAssignments } from './variable-assignments';
import { WizardFooter } from './wizard-footer';
import { WizardStepIndicator, type StepMeta } from './wizard-step-indicator';

const STEP_META: Record<WizardStep, { label: string; title: string; description: string }> = {
	1: {
		label: 'Type',
		title: 'Message recipients & channel',
		description: 'Choose who receives this message and how it is delivered.',
	},
	2: {
		label: 'Message recipients',
		title: 'Select message recipients',
		description: 'Search and pick who to include.',
	},
	3: {
		label: 'Personalize',
		title: 'Personalize',
		description: 'Fill each template variable from a recipient field or a fixed value.',
	},
	4: {
		label: 'Review',
		title: 'Review & send',
		description: 'Confirm the audience and message before it goes out.',
	},
};

type SendMessageWizardProps = {
	template: TwilioTemplateDetail;
	onClose: () => void;
	onLockChange: (locked: boolean) => void;
};

export const SendMessageWizard = ({ template, onClose, onLockChange }: SendMessageWizardProps) => {
	const [currentStep, setCurrentStep] = useState<WizardStep>(1);
	const [type, setType] = useState<MessagingRecipientType | null>(null);
	const [channel, setChannel] = useState<MessagingChannel | null>(null);
	const [query, setQuery] = useState<RecipientsTableQuery | null>(null);
	const [selection, setSelection] = useState<SelectionState>(emptySelection());
	const [lastResetReason, setLastResetReason] = useState<ResetReason>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [assignments, setAssignments] = useState<VariableAssignments>(emptyAssignments());
	const [previewForSend, setPreviewForSend] = useState<ChannelPreviewSummary | null>(null);

	const send = useMessagingSend();
	const isSending = send.phase !== 'idle';

	useEffect(() => {
		onLockChange(send.phase === 'running');
	}, [send.phase, onLockChange]);

	// Templates without variables skip the Personalize step entirely.
	const hasVariables = template.variables.length > 0;
	const sequence: WizardStep[] = hasVariables ? [1, 2, 3, 4] : [1, 2, 4];
	const steps: StepMeta[] = sequence.map((step) => ({ step, label: STEP_META[step].label }));

	const currentIndex = sequence.indexOf(currentStep);
	const isFirstStep = currentIndex === 0;
	const isFinalStep = currentIndex === sequence.length - 1;

	const canAdvance = canAdvanceFromStep(currentStep, {
		type,
		channel,
		selection,
		totalCount,
		variables: template.variables,
		assignments,
	});
	const canSend = previewForSend !== null && previewForSend.primary + previewForSend.fallback > 0;

	const handleTypeChange = (next: MessagingRecipientType | null) => {
		setType(next);
		setQuery(next ? { type: next, page: 1, search: '', filters: {} } : null);
		setSelection(emptySelection());
		setLastResetReason(null);
		setTotalCount(0);
		setAssignments(emptyAssignments());
		setPreviewForSend(null);
		setCurrentStep(1);
	};

	const goToStep = (step: WizardStep) => {
		// Leaving Review discards its channel preview so it is recomputed on return.
		if (currentStep === 4) {
			setPreviewForSend(null);
		}
		setCurrentStep(step);
	};

	const handleBack = () => {
		if (!isFirstStep) {
			goToStep(sequence[currentIndex - 1]);
		}
	};

	const handleNext = () => {
		if (!isFinalStep && canAdvance) {
			setCurrentStep(sequence[currentIndex + 1]);
		}
	};

	const handleStepSelect = (step: WizardStep) => {
		if (sequence.indexOf(step) < currentIndex) {
			goToStep(step);
		}
	};

	const handleSend = () => {
		if (!type || !channel) {
			return;
		}
		send.start({ templateSid: template.sid, channel, recipientType: type, selection, assignments });
	};

	const meta = STEP_META[currentStep];

	return (
		<>
			<div className="-mx-6 border-b px-6 pb-2">
				<DialogTitle className="pr-8 text-lg">
					Send <span className="text-muted-foreground">“{template.friendlyName}”</span>
				</DialogTitle>
				<div className="mt-2">
					<WizardStepIndicator
						steps={steps}
						currentStep={currentStep}
						allComplete={isSending}
						onStepSelect={isSending ? undefined : handleStepSelect}
					/>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
				{isSending && channel ? (
					<SendProgress
						phase={send.phase}
						status={send.status}
						error={send.error}
						resultsUnavailable={send.resultsUnavailable}
						channel={channel}
					/>
				) : (
					<div className={cn('space-y-5', currentStep === 2 && 'flex min-h-0 flex-1 flex-col space-y-3')}>
						<div className="space-y-1">
							<h3 className="text-base font-medium">{meta.title}</h3>
							{currentStep !== 2 && <p className="text-muted-foreground text-sm">{meta.description}</p>}
						</div>

						{currentStep === 1 && (
							<Step1RecipientType
								type={type}
								channel={channel}
								supportedChannels={template.supportedChannels}
								onTypeChange={handleTypeChange}
								onChannelChange={setChannel}
							/>
						)}

						{currentStep === 2 && query && (
							<Step2Recipients
								query={query}
								selection={selection}
								lastResetReason={lastResetReason}
								onQueryChange={setQuery}
								onSelectionChange={setSelection}
								onLastResetReasonChange={setLastResetReason}
								onTotalCountChange={setTotalCount}
							/>
						)}

						{currentStep === 3 && (
							<Step3Assignments
								body={template.body}
								variables={template.variables}
								type={type}
								assignments={assignments}
								onChange={setAssignments}
							/>
						)}

						{currentStep === 4 && (
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
					</div>
				)}
			</div>

			<WizardFooter
				sendPhase={send.phase}
				isFirstStep={isFirstStep}
				isFinalStep={isFinalStep}
				canAdvance={canAdvance}
				canSend={canSend}
				onBack={handleBack}
				onNext={handleNext}
				onSend={handleSend}
				onClose={onClose}
			/>
		</>
	);
};
