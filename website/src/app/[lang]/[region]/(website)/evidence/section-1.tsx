import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-evidence'],
	});

	return (
		<BaseContainer className="mt-12 flex flex-col items-center space-y-4">
			<div className="w-2/3 text-center">
				{translator.t<{ text: string; color?: FontColor }[]>('section-1.title').map((title, index) => (
					<Typography as="span" key={index} size="4xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</div>
			<Typography as="h2" size="xl" className="max-w-2xl text-center">
				{translator.t('section-1.subtitle')}
			</Typography>
		</BaseContainer>
	);
}
