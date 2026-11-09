import { getTranslations } from 'next-intl/server';
import { ProgramSetupSuccess } from './program-setup-success';
import { SectionTitle } from './section-title';

type ProgramSetupSectionProps = {
	programId: string;
	publicUrl: string;
};

export const ProgramSetupSection = async ({ programId, publicUrl }: ProgramSetupSectionProps) => {
	const t = await getTranslations('portal-operations');

	return (
		<div className="space-y-4">
			<SectionTitle>{t('program.setup.title')}</SectionTitle>
			<ProgramSetupSuccess programId={programId} publicUrl={publicUrl} />
		</div>
	);
};
