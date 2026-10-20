'use client';

import { usePortalOperationsTranslations } from '@/app/portal/portal-operations-translations';
import { auditLogTab } from '@/components/audit/audit-log-tab';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { ProgramSettingsForm } from './program-settings-form';

type ProgramSettingsDialogProps = {
	programId: string;
	readOnly: boolean;
};

export const ProgramSettingsDialog = ({ programId, readOnly }: ProgramSettingsDialogProps) => {
	const t = usePortalOperationsTranslations();
	const [isOpen, setIsOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleError = (error: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(t('program.settings.error_updating', { message }));
		console.error('Program Settings Form Error', { error });
	};

	const closeDialog = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			setErrorMessage(null);
		}
	};

	return (
		<>
			<Button variant="outline" onClick={() => setIsOpen(true)}>
				<Settings className="size-4" />
				{t('program.settings.title')}
			</Button>

			<TabbedDialog
				open={isOpen}
				onOpenChange={closeDialog}
				title={readOnly ? t('program.settings.view_title') : t('program.settings.title')}
				tabs={[
					{
						value: 'details',
						label: t('program.settings.details'),
						content: (
							<>
								{errorMessage && (
									<Alert variant="destructive">
										<AlertTitle>{t('common.error')}</AlertTitle>
										<AlertDescription>{errorMessage}</AlertDescription>
									</Alert>
								)}

								<ProgramSettingsForm
									programId={programId}
									readOnly={readOnly}
									onSuccess={() => closeDialog(false)}
									onCancel={() => closeDialog(false)}
									onError={handleError}
								/>
							</>
						),
					},
					auditLogTab('program', programId),
				]}
			/>
		</>
	);
};
