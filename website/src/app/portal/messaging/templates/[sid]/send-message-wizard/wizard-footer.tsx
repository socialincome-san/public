'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { WizardFooter as WizardFooterLayout } from '@socialincome/design-system/navigation/wizard-footer/wizard-footer';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SendPhase } from './use-messaging-send';

type WizardFooterProps = {
	sendPhase: SendPhase;
	isFirstStep: boolean;
	isFinalStep: boolean;
	canAdvance: boolean;
	canSend: boolean;
	onBack: () => void;
	onNext: () => void;
	onSend: () => void;
	onClose: () => void;
};

export const WizardFooter = ({
	sendPhase,
	isFirstStep,
	isFinalStep,
	canAdvance,
	canSend,
	onBack,
	onNext,
	onSend,
	onClose,
}: WizardFooterProps) => {
	const t = useTranslations('portal-messaging');

	if (sendPhase === 'running') {
		return (
			<WizardFooterLayout
				edge="bleed"
				primary={
					<Button variant="outline" disabled>
						<Loader2 className="animate-spin" />
						{t('wizard.progress.sending')}
					</Button>
				}
			/>
		);
	}

	if (sendPhase === 'results') {
		return <WizardFooterLayout edge="bleed" primary={<Button onClick={onClose}>{t('wizard.actions.done')}</Button>} />;
	}

	return (
		<WizardFooterLayout
			edge="bleed"
			back={
				<Button variant="outline" onClick={onBack} disabled={isFirstStep}>
					{t('wizard.actions.back')}
				</Button>
			}
			primary={
				isFinalStep ? (
					<Button variant="confirmed" onClick={onSend} disabled={!canSend}>
						{t('wizard.actions.sendMessage')}
					</Button>
				) : (
					<Button onClick={onNext} disabled={!canAdvance}>
						{t('wizard.actions.next')}
					</Button>
				)
			}
		/>
	);
};
