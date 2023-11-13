import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Section1Form from './section-1-form';

export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-home', 'common'],
	});

	return (
		<BaseContainer
			backgroundColor="bg-blue-50"
			className="grid min-h-[calc(100vh-theme(spacing.20))] grid-cols-1 content-center items-center gap-y-8 lg:grid-cols-2"
		>
			<div className="mx-auto max-w-3xl">
				<Typography size="5xl" weight="bold" lineHeight="tight">
					{translator.t('section-1.title-1')}
					<Typography as="span" size="5xl" weight="bold" color="secondary" lineHeight="tight">
						{translator.t('section-1.title-2')}
					</Typography>
					{translator.t('section-1.title-3')}
				</Typography>
			</div>
			<div className="mx-auto max-w-2xl">
				<Section1Form
					translations={{
						text: translator.t('section-1.income-text'),
						currency: translator.t('currency'),
						submit: translator.t('section-1.button-text'),
					}}
				/>
			</div>
		</BaseContainer>
	);
}
