import { DefaultParams } from '@/app/[lang]/[region]';
import { Button } from '@/components/button';
import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';

export const CreateProgram = async ({ lang }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer className="my-20 text-center">
			<div className="theme-blue mx-auto max-w-3xl rounded-2xl px-6 py-12 md:px-10">
				<Typography size="3xl" className="mb-4">
					{translator.t('section-create-program.title')}
				</Typography>
				<Typography className="mx-auto mb-8 max-w-2xl">{translator.t('section-create-program.description')}</Typography>
				<CreateProgramModal trigger={<Button>{translator.t('section-create-program.cta')}</Button>} />
			</div>
		</BaseContainer>
	);
};
