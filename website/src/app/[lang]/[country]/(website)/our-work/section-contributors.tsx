import { DefaultPageProps } from '@/app/[lang]/[country]';
import { SectionContributorsCarousel } from '@/app/[lang]/[country]/(website)/our-work/section-contributors-carousel';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function SectionContributors({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-our-work'],
	});

	return (
		<BaseContainer
			id="contributors"
			backgroundColor="bg-indigo-50"
			className="flex min-h-screen flex-col justify-center space-y-64"
		>
			<div>
				<Typography as="h3" size="xl" color="muted-foreground">
					{translator.t('section-contributors.header-1')}
				</Typography>
				<Typography as="h1" size="4xl" weight="bold">
					{translator.t('section-contributors.title-1')}
				</Typography>
				<Typography as="h2" size="2xl">
					{translator.t('section-contributors.text-1')}
				</Typography>
				<SectionContributorsCarousel />
			</div>

			<div>
				<Typography as="h3" size="xl" color="muted-foreground">
					{translator.t('section-contributors.header-2')}
				</Typography>
				<Typography as="h1" size="4xl" weight="bold">
					{translator.t('section-contributors.title-2')}
				</Typography>
				<Typography as="h2" size="2xl">
					{translator.t('section-contributors.text-2')}
				</Typography>
			</div>
		</BaseContainer>
	);
}
