'use client';

import { GlowHoverContainer, Typography } from '@socialincome/ui';

import NewsletterForm from '@/components/newsletter-form/newsletter-form';

const NewsletterGlowContainer = ({ title, lang, formTranslations }) => {
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
