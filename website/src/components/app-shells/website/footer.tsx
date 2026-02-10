import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { ISbStoryData } from '@storyblok/js';
import NextLink from 'next/link';

const storyblokService = new StoryblokService();

type Props = {
	lang: WebsiteLanguage;
};

export const Footer = async ({ lang }: Props) => {
	const { content } = await storyblokService.getStoryWithFallback<ISbStoryData<Layout>>(
		`${NEW_WEBSITE_SLUG}/layout`,
		lang,
	);

	return (
		<div className="bg-primary container grid grid-cols-[334px_auto] gap-4 rounded-3xl px-16 pb-8 pt-14 text-white">
			<div>
				<SocialIncomeLogo width={222} height={22} />
			</div>
			<div className="mt-16">
				<div className="grid grid-flow-col gap-4">
					{content.footerMenu.map((menuGroup) => (
						<div key={menuGroup._uid}>
							<h5 className="text-base font-medium text-white">{menuGroup.label}</h5>
							<ul>
								{menuGroup.items?.map((item) => (
									<li key={item._uid}>
										<NextLink href={item.link?.url as string} className="font-medium text-white/50">
											{item.label}
										</NextLink>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				{content.copyrightNotice && (
					<div className="mt-16">
						<p className="text-xs font-medium text-white/50">
							{content.copyrightNotice.replace('%YEAR%', new Date().getFullYear().toString())}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
