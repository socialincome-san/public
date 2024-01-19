import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function AddressInequality({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer backgroundColor="bg-red-50" className="flex min-h-screen flex-col justify-center py-16 md:py-32">
			<p className="mb-8 lg:mb-16">
				<Typography as="span" size="4xl" weight="bold">
					{translator.t('section-4.title-1')}
				</Typography>
				<Typography as="span" size="4xl" weight="bold" color="secondary">
					{translator.t('section-4.title-2')}
				</Typography>
			</p>
			<div className="grid gap-8 lg:grid-cols-3 lg:gap-16">
				<Typography size="2xl" weight="medium">
					{translator.t('section-4.subtitle')}
				</Typography>
				<div className="col-span-2 flex max-w-2xl flex-col space-y-4">
					<Typography size="lg">{translator.t('section-4.paragraph-1')}</Typography>
					<Typography size="lg">{translator.t('section-4.paragraph-2')}</Typography>
					<Typography size="lg">{translator.t('section-4.paragraph-3')}</Typography>
					<Typography size="lg">{translator.t('section-4.paragraph-4')}</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}
