import { DefaultParams } from '@/app/[lang]/[region]';
import { FaqQuestion, FAQSection } from '@/components/legacy/faq/faq-section';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Link from 'next/link';

export async function SelectionFaq({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-home', 'website-faq', 'website-selection'],
	});

	return (
		<BaseContainer className="my-10 flex flex-col space-y-8">
			<div className="mx-auto mb-4 mt-20 max-w-2xl">
				{translator.t<{ text: string; color?: FontColor }[]>('section-5.title').map((title, index) => (
					<Typography
						key={index}
						as="span"
						weight="medium"
						color={title.color}
						className="text-3xl sm:text-4xl md:text-4xl"
					>
						{title.text}
					</Typography>
				))}
			</div>
			<FAQSection questions={[...translator.t<FaqQuestion[]>('selection.questions')]} />
			<Link href={'/faq'}>
				<Typography color="accent" className="text-center">
					{translator.t('section-faq.cta') + ' ›'}
				</Typography>
			</Link>
		</BaseContainer>
	);
}
