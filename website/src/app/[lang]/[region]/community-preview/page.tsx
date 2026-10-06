import type { DefaultPageProps } from '@/app/[lang]/[region]';
import { buildTeaserAvatars, loadBehindTheScenesData } from '@/components/behind-the-scenes/behind-the-scenes-data';
import { BehindTheScenesPanel } from '@/components/behind-the-scenes/behind-the-scenes-panel';
import { BehindTheScenesProvider } from '@/components/behind-the-scenes/behind-the-scenes-provider';
import { BehindTheScenesTeaser } from '@/components/behind-the-scenes/behind-the-scenes-teaser';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { HeroHeader } from '@/components/storyblok/shared/hero-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getProgramTitle } from '@/lib/storyblok/program-story';
import { getProgramBySlug } from '@/modules/storyblok-content/storyblok-content.service';
import { cn } from '@socialincome/design-system/cn';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { headingStyles } from '@socialincome/design-system/layout/section-heading/heading-styles';

export default async function CommunityPreviewPage({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const language = lang as WebsiteLanguage;
	const websiteRegion = region as WebsiteRegion;
	const [translator, communityData, programResult] = await Promise.all([
		Translator.getInstance({ language, namespaces: ['website-open-source'] }),
		loadBehindTheScenesData('community-preview', language),
		getProgramBySlug('sierra-leone-core-program', language),
	]);
	const programStory = programResult.success ? programResult.data : null;
	const programTitle = programStory ? getProgramTitle(programStory.content) : 'Sierra Leone Unconditional';
	const programFullSlug = programStory?.full_slug ?? 'pages/programs/sierra-leone-core-program';
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: programFullSlug,
		currentLabel: programTitle,
		lang: language,
		region: websiteRegion,
	});

	return (
		<BehindTheScenesProvider panel={<BehindTheScenesPanel data={communityData} lang={language} region={websiteRegion} />}>
			<HeroHeader
				lang={language}
				title={programTitle}
				heroImage={programStory?.content.primaryImage}
				stats={[]}
				showDonationForm={false}
				showDonationsFormMobile={false}
			/>
			<div className="flex flex-col gap-8 py-8">
				<BlockWrapper disableMarginTop disableMarginBottom>
					<div className="flex items-center justify-between gap-4">
						<Breadcrumb links={breadcrumbLinks} layout="inline" />
						<BehindTheScenesTeaser
							tickerItems={[
								translator.t('behind-the-scenes.teaser.ticker.open'),
								translator.t('behind-the-scenes.teaser.ticker.volunteers', {
									context: { count: communityData.peopleTotal },
								}),
								translator.t('behind-the-scenes.teaser.ticker.contribute'),
								translator.t('behind-the-scenes.teaser.ticker.cta'),
							]}
							ariaLabel={translator.t('behind-the-scenes.teaser.aria')}
							avatars={buildTeaserAvatars(communityData)}
						/>
					</div>
				</BlockWrapper>
				<BlockWrapper disableMarginTop disableMarginBottom>
					<div className="grid gap-8 lg:grid-cols-2">
						<section className="bg-card flex flex-col gap-5 rounded-3xl p-8 shadow-lg">
							<p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">About the program</p>
							<h2 className={cn(headingStyles[2], 'text-foreground')}>{programTitle}</h2>
							<p className="text-foreground text-lg leading-relaxed">
								{programStory?.content.description ??
									'Social Income provides unconditional cash transfers to people living in poverty in Sierra Leone.'}
							</p>
						</section>
						<aside className="bg-card flex flex-col justify-between gap-8 rounded-3xl p-8 shadow-lg">
							<div className="flex flex-col gap-3">
								<p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">Community</p>
								<h2 className={cn(headingStyles[3], 'text-foreground')}>The people make the program possible.</h2>
								<p className="text-muted-foreground text-base">
									The entry point sits beside the breadcrumb so it remains visible without competing with the page content.
								</p>
							</div>
							<p className="text-muted-foreground text-sm">
								Use the community pill above to open the full behind-the-scenes panel.
							</p>
						</aside>
					</div>
				</BlockWrapper>
			</div>
		</BehindTheScenesProvider>
	);
}
