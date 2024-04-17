import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function Overview({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	return (
		<BaseContainer className="mb-32 mt-10 flex flex-col items-center justify-center">
			<Typography size="3xl" weight="medium" color="foreground-dark" className="my-10 w-3/5 text-center">
				{translator.t('section-2.title-1')}
			</Typography>
			<div className="w-3/5 text-center">
				{translator.t<{ text: string; color?: FontColor }[]>('section-2.title-2').map((title, index) => (
					<Typography
						as="span"
						size="3xl"
						weight="medium"
						color={title.color}
						key={index}
						className="w-3/5 text-center"
					>
						{title.text}{' '}
					</Typography>
				))}
			</div>
			<Typography size="3xl" weight="medium" color="foreground-dark" className="mb-5 mt-12 w-3/5 text-center">
				{translator.t('section-2.title-3')}
			</Typography>
			<ol className="w-3/5 list-decimal">
				<li>
					<Typography>{translator.t('section-2.text-3.1')}</Typography>
				</li>
				<li>
					<Typography>{translator.t('section-2.text-3.2')}</Typography>
				</li>
			</ol>
			<Typography size="3xl" weight="medium" color="foreground-dark" className="mb-5 mt-12 w-3/5 text-center">
				{translator.t('section-2.title-4')}
			</Typography>
			<Typography className="w-3/5">{translator.t('section-2.text-4')}</Typography>
			<Typography size="3xl" weight="medium" color="foreground-dark" className="mb-5 mt-12 w-3/5 text-center">
				{translator.t('section-2.title-5')}
			</Typography>
			<Typography className="w-3/5">{translator.t('section-2.text-5')}</Typography>
		</BaseContainer>
	);
}
