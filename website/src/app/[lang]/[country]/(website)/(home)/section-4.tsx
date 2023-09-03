import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Section4({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer className="bg-base-red">
			<div className="flex min-h-screen flex-col  justify-center">
				<p className="mb-8 lg:mb-16">
					<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed">
						{translator.t('section-4.title-1')}
					</Typography>
					<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed" color="secondary">
						{translator.t('section-4.title-2')}
					</Typography>
				</p>
				<div className="grid gap-8 lg:grid-cols-3 lg:gap-16">
					<Typography size="2xl" weight="medium" lineHeight="relaxed">
						{translator.t('section-4.subtitle')}
					</Typography>
					<div className="col-span-2 flex max-w-2xl flex-col space-y-8">
						<Typography size="xl">{translator.t('section-4.paragraph-1')}</Typography>
						<Typography size="xl">{translator.t('section-4.paragraph-2')}</Typography>
						<Typography size="xl">{translator.t('section-4.paragraph-3')}</Typography>
						<Typography size="xl">{translator.t('section-4.paragraph-4')}</Typography>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}
