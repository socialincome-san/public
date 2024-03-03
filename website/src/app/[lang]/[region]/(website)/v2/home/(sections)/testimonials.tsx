import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function Testimonials({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer>
			<Typography>{translator.t('section-9.testimonial-1')}</Typography>
			<Typography>{translator.t('section-9.author-1')}</Typography>
			<Typography>{translator.t('section-9.testimonial-2')}</Typography>
			<Typography>{translator.t('section-9.author-2')}</Typography>
			<Typography>{translator.t('section-9.testimonial-3')}</Typography>
			<Typography>{translator.t('section-9.author-3')}</Typography>
		</BaseContainer>
	);
}
