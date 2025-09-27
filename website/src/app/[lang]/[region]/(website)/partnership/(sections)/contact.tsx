import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography, linkCn } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function Contact({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partnership'],
	});

	return (
		<div className="mx-auto mb-8 pt-20 flex w-4/5 flex-col items-center justify-center md:mb-20 lg:w-3/5">
			<Typography weight="medium" className="mb-12 text-center text-3xl sm:text-4xl md:text-4xl">
				{translator.t('contact.title')}
			</Typography>
			<Typography size="xl" className="mb-12 text-center leading-relaxed">
				{translator.t('contact.subtitle')}
				<a
					href="mailto:hello@socialincome.org"
					target="_blank"
					rel="noopener noreferrer"
					className={linkCn({ arrow: 'external', underline: 'none', size: 'xl' })}
				>
					hello@socialincome.org
				</a>
			</Typography>
		</div>
	);
}