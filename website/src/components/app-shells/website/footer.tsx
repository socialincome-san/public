import { FacebookIcon } from '@/components/svg/facebook';
import { GithubIcon } from '@/components/svg/github';
import { InstagramIcon } from '@/components/svg/instagram';
import { LinkedinIcon } from '@/components/svg/linkedin';
import { PaperPlaneIcon } from '@/components/svg/paper-plane';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import { Layout, MenuItem } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { ISbStoryData } from '@storyblok/js';
import NextLink from 'next/link';

const storyblokService = new StoryblokService();

type Props = {
	lang: WebsiteLanguage;
	region: string;
};

const IconMap: Record<NonNullable<Exclude<MenuItem['icon'], ''>>, React.ComponentType<{ className?: string }>> = {
	instagram: InstagramIcon,
	linkedin: LinkedinIcon,
	facebook: FacebookIcon,
	github: GithubIcon,
	newsletter: PaperPlaneIcon,
};

export const Footer = async ({ lang, region }: Props) => {
	const storyResult = await storyblokService.getStoryWithFallback<ISbStoryData<Layout>>(
		`${NEW_WEBSITE_SLUG}/layout`,
		lang,
	);
	if (!storyResult.success) {
		return null;
	}

	const content = storyResult.data.content;

	return (
		<div className="bg-primary container grid grid-cols-1 gap-4 rounded-3xl px-8 pb-8 pt-10 text-white sm:px-16 sm:pt-14 lg:grid-cols-[334px_auto]">
			<div>
				<SocialIncomeLogo width={222} height={22} />
			</div>
			<div className="mt-8 lg:mt-16">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
					{content.footerMenu.map((menuGroup) => (
						<div key={menuGroup._uid}>
							<h5 className="text-lg font-bold text-white">{menuGroup.label}</h5>
							<ul className="mt-4 space-y-3">
								{menuGroup.items?.map((item) => {
									const Icon = item.icon ? IconMap[item.icon] : null;
									return (
										<li key={item._uid}>
											<NextLink
												href={resolveStoryblokLink(item.link, lang, region)}
												target={item.newTab ? '_blank' : '_self'}
												rel={item.newTab ? 'noopener noreferrer' : undefined}
												className="flex items-center gap-3 font-medium text-white/50 transition-colors hover:text-white"
											>
												{Icon && <Icon className="text-input" />}
												{item.label}
											</NextLink>
										</li>
									);
								})}
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
