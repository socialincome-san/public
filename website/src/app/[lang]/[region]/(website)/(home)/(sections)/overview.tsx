import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export const Overview = async ({ lang }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer className="mx-auto mb-16 mt-8 flex w-4/5 flex-col items-center justify-center md:mb-48 md:mt-16 lg:w-3/5">
			<Typography size="3xl" weight="medium" className="my-10 text-center">
				{translator.t('section-2.title-1')}
			</Typography>
			<div className="mb-8 text-center">
				{translator.t<{ text: string; color?: FontColor }[]>('section-2.title-2').map((title, index) => (
					<Typography as="span" size="3xl" weight="medium" color={title.color} key={index}>
						{title.text}{' '}
					</Typography>
				))}
			</div>
			<Typography size="3xl" weight="medium" className="mb-5 mt-12 text-center">
				{translator.t('section-2.title-3')}
			</Typography>
			<ol className="mb-8 list-decimal">
				<li>
					<Typography as="span">{translator.t('section-2.text-3.1')}</Typography>
				</li>
				<li>
					<Typography as="span">{translator.t('section-2.text-3.2')}</Typography>
				</li>
			</ol>
			<Typography size="3xl" weight="medium" className="mb-5 mt-12 text-center">
				{translator.t('section-2.title-4')}
			</Typography>
			<Typography className="mb-8">{translator.t('section-2.text-4')}</Typography>
			<Typography size="3xl" weight="medium" className="mb-5 mt-12 text-center">
				{translator.t('section-2.title-5')}
			</Typography>
			<Typography className="w-full">{translator.t('section-2.text-5')}</Typography>
		</BaseContainer>
	);
}
