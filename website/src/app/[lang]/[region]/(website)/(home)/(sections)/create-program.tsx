import { DefaultParams } from '@/app/[lang]/[region]';
import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import Image from 'next/image';
import Somaha from '../(assets)/logo-somaha.svg';

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
				<div className="mt-8 flex items-center justify-center gap-3">
					<Typography className="text-left text-white/60">{translator.t('section-create-program.partner')}</Typography>
					<a href="https://somaha-stiftung.ch/en/home/" target="_blank" rel="noopener noreferrer">
						{/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
						<Image src={Somaha} alt="Somaha" className="h-6 w-auto shrink-0 opacity-60 brightness-0 invert" />
					</a>
				</div>
			</div>
		</BaseContainer>
	);
};
