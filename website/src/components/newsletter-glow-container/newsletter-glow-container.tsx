'use client';

import { GlowHoverContainer, Typography } from '@socialincome/ui';
import { LanguageCode } from '@socialincome/shared/src/types/language';

import NewsletterForm from '@/components/newsletter-form/newsletter-form';
import { NewsletterPopupTranslations } from "@/components/newsletter-popup/newsletter-popup-client";

type NewsletterGlowContainerProps = {
	title: string;
	lang: LanguageCode;
	formTranslations: NewsletterPopupTranslations
};

const NewsletterGlowContainer = ({ title, lang, formTranslations }: NewsletterGlowContainerProps) => {
	return (
		<GlowHoverContainer>
			<div className="flex flex-col items-center py-12">
				<div className="align-center flex flex-col">
					<Typography size="2xl" color="foreground" weight="medium">
						{title}
					</Typography>
				</div>
				<div className="mt-8 flex w-full justify-center sm:w-full md:max-w-md">
					<NewsletterForm lang={lang} translations={formTranslations} />
				</div>
			</div>
		</GlowHoverContainer>
	);
};

export default NewsletterGlowContainer;
