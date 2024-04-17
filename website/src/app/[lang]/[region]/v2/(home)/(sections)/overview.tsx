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
		<BaseContainer className='flex flex-col justify-center items-center mt-10 mb-32'>
			<Typography size="3xl" weight='medium' color="foreground-dark" className='text-center w-3/5 my-10'>
				{translator.t('section-2.title-1')}
			</Typography>
			<div className='w-3/5 text-center'>
			{translator.t<{ text: string; color?: FontColor }[]>('section-2.title-2').map((title, index) => (
				<Typography as='span' size="3xl" weight='medium' color={title.color} key={index} className='text-center w-3/5'>
				{title.text}{' '}
				</Typography>
			))}
			</div>
			<Typography size="3xl" weight='medium' color="foreground-dark" className='text-center w-3/5 mt-12 mb-5'>
				{translator.t('section-2.title-3')}
			</Typography>
			<ol className='w-3/5'>
			<li><Typography>{translator.t('section-2.text-1.1')}</Typography></li>
			<li><Typography>{translator.t('section-2.text-1.2')}</Typography></li>
			</ol>
			<Typography size="3xl" weight='medium' color="foreground-dark" className='text-center w-3/5 mt-12 mb-5'>{translator.t('section-2.title-4')}</Typography>
			<Typography className='w-3/5'>{translator.t('section-2.text-2')}</Typography>
			<Typography size="3xl" weight='medium' color="foreground-dark" className='text-center w-3/5 mt-12 mb-5'>{translator.t('section-2.title-5')}</Typography>
			<Typography className='w-3/5'>{translator.t('section-2.text-3')}</Typography>
		</BaseContainer>
	);
}
