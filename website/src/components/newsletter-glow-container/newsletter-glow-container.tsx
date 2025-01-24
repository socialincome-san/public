'use client'

import {
    GlowHoverContainer,
    Typography
} from "@socialincome/ui";

import NewsletterForm from "@/components/newsletter-form/newsletter-form";

const NewsletterGlowContainer = ({ title, formTranslations }) => {

    return (
        <GlowHoverContainer>
            <div className="flex flex-col items-center py-12">
                <div className="flex flex-col align-center">
                    <Typography size="2xl" color="foreground" weight="medium">
                        {title}
                    </Typography>
                </div>
                <div className="flex sm:w-full md:max-w-md w-full justify-center mt-8">
                    <NewsletterForm translations={formTranslations} />
                </div>
            </div>
        </GlowHoverContainer>
    );
};

export default NewsletterGlowContainer;
