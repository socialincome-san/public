import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

type Translation = {
	title: string;
	color?: string;
}[];

const joinTranslation = (element: Translation[]): React.JSX.Element[] => {
	return element.map((phrase, index) => (
		<Typography as="span" key={index} color={phrase?.color}>
			{phrase.text}{' '}
		</Typography>
	));
};

export async function Introduction({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	const titles = translator.t<Translation[][]>('section-2.titles');
	const subtitles = translator.t<Translation[][]>('section-2.subtitles');
	return (
		<BaseContainer>
			<div>
				{/*{titles[0].map((title, index) => (*/}
				{/*	<Typography as="span" key={index} color={title?.color}>*/}
				{/*		{title.text}{' '}*/}
				{/*	</Typography>*/}
				{/*))}*/}
				{joinTranslation(titles[0])}
			</div>
			<div>{joinTranslation(titles[1])}</div>
			{/*<Typography>{translator.t('section-2.subtitle-1')}</Typography>*/}
			{joinTranslation(subtitles[0])}
			<Typography>{translator.t('section-2.text-1.1')}</Typography>
			<Typography>{translator.t('section-2.text-1.2')}</Typography>
			{/*<Typography>{translator.t('section-2.subtitle-2')}</Typography>*/}
			{joinTranslation(subtitles[1])}
			<Typography>{translator.t('section-2.text-2')}</Typography>
			{/*<Typography>{translator.t('section-2.subtitle-3')}</Typography>*/}
			{joinTranslation(subtitles[2])}
			<Typography>{translator.t('section-2.text-3')}</Typography>
		</BaseContainer>
	);
}
