import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { SuccessBanner } from '@socialincome/design-system/feedback/success-banner/success-banner';
import { ChevronRightIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

type ProgramSetupSuccessProps = {
	programId: string;
	publicUrl: string;
};

export const ProgramSetupSuccess = async ({ programId, publicUrl }: ProgramSetupSuccessProps) => {
	const t = await getPortalOperationsTranslations();

	return (
		<Card>
			<div className="space-y-6">
				<h1 className="text-2xl font-bold">{t('program.setup.greeting')}</h1>

				<SuccessBanner
					title={t('program.setup.recipients_complete')}
					description={t('program.setup.recipients_assigned')}
					action={
						<Link href={`/portal/programs/${programId}/recipients`}>
							<Button variant="outline">
								{t('program.setup.view_recipients')} <ChevronRightIcon className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					}
				/>

				<SuccessBanner
					title={t('program.setup.surveys_configured')}
					description={t('program.setup.survey_tracking_active')}
					action={
						<Link href={`/portal/programs/${programId}/surveys`}>
							<Button variant="outline">
								{t('program.setup.view_surveys')} <ChevronRightIcon className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					}
				/>

				<SuccessBanner
					title={t('program.setup.public_page_ready')}
					description={t('program.setup.public_page_description')}
					action={
						<Link href={publicUrl} target="_blank">
							<Button variant="outline">
								{t('program.setup.view_public_page')} <ExternalLinkIcon className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					}
				/>
			</div>
		</Card>
	);
};
