import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-arts'],
	});

	return (
		<BaseContainer className="min-h-screen-navbar flex items-center justify-center">
			<p className="w-2/3 text-center">
				{translator.t<{ text: string; color?: FontColor }[]>('section-1.title').map((title, index) => (
					<Typography as="span" key={index} size="5xl" weight="bold" color={title.color}>
						{title.text}
					</Typography>
				))}
			</p>
		</BaseContainer>
	);
}
