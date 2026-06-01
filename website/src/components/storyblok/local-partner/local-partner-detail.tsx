import { Badge } from '@/components/badge';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { Focus } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { ISbStoryData } from '@storyblok/js';

import { TestimonialCarouselBlock } from '@/components/content-blocks/testimonial-carousel';
import type { TestimonialCarousel } from '@/generated/storyblok/types/109655/storyblok-components';
import Link from 'next/link';
import { MapBubble } from '../country/map-bubble';
import type { FocusStory } from '../focus/focus.types';
import { getFocusSlug, getFocusTitle } from '../focus/focus.utils';
import { HeroHeader } from '../shared/hero-header';
import { LocalPartnerPartners } from './local-partner-partners';
import { LocalPartnerPayoutsTotal } from './local-partner-payouts-total';
import { LocalPartnerPrograms } from './local-partner-programs';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerTitle } from './local-partner.utils';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	recipientsCount?: number;
	completedSurveysCount?: number;
};

const isFocusStory = (value: unknown): value is ISbStoryData<Focus> => {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (!('content' in value)) {
		return false;
	}

	const story = value as { content?: unknown; uuid?: unknown };
	if (!story.uuid || typeof story.uuid !== 'string') {
		return false;
	}
	if (!story.content || typeof story.content !== 'object') {
		return false;
	}

	const content = story.content as { component?: unknown };

	return typeof content.component === 'string' && content.component.toLowerCase() === 'focus';
};

const asTrimmedString = (value: unknown): string | undefined => {
	if (typeof value !== 'string') {
		return undefined;
	}
	const trimmed = value.trim();

	return trimmed ? trimmed : undefined;
};

const asStoryblokMultilink = (value: unknown): StoryblokMultilink | undefined => {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	if (!('linktype' in value)) {
		return undefined;
	}
	if (typeof (value as { linktype?: unknown }).linktype !== 'string') {
		return undefined;
	}

	return value as StoryblokMultilink;
};

export const LocalPartnerDetail = async ({ localPartner, lang, region, recipientsCount, completedSurveysCount }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const localPartnerTitle = getLocalPartnerTitle(localPartner.content);
	const localPartnerDescription = localPartner.content.description;
	const heroImageFilename = localPartner.content.heroImage?.filename;
	const heroImageAlt = localPartner.content.heroImage?.alt ?? localPartnerTitle;
	const isoCodeRaw = (localPartner.content as { countryIsoCode?: unknown }).countryIsoCode;
	const isoCode =
		typeof isoCodeRaw === 'string' || typeof isoCodeRaw === 'number' ? isoCodeRaw.toString().trim() : undefined;

	const localPartnerContent = localPartner.content as unknown as Record<string, unknown>;
	const mission = asTrimmedString(localPartnerContent.mission);
	const partnerSince = asTrimmedString(localPartnerContent.partnerSince);
	const foundingYear = asTrimmedString(localPartnerContent.foundingYear);
	const location = asTrimmedString(localPartnerContent.location);
	const externalLinks: { label: string; link: StoryblokMultilink | undefined }[] = [
		{ label: 'Website', link: asStoryblokMultilink(localPartnerContent.website) },
		{ label: 'LinkedIn', link: asStoryblokMultilink(localPartnerContent.linkedin) },
		{ label: 'Instagram', link: asStoryblokMultilink(localPartnerContent.instagram) },
		{ label: 'Facebook', link: asStoryblokMultilink(localPartnerContent.facebook) },
		{ label: 'YouTube', link: asStoryblokMultilink(localPartnerContent.youtube) },
	];
	const resolvedExternalLinks = externalLinks
		.map(({ label, link }) => {
			const href = resolveStoryblokLink(link, lang, region);

			return href !== '#' ? { label, href } : null;
		})
		.filter((value): value is { label: string; href: string } => value !== null);

	const focuses = (localPartner.content.focuses ?? []).filter(isFocusStory) as FocusStory[];
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: localPartner.full_slug,
		currentLabel: localPartnerTitle,
		lang,
		region,
	});

	return (
		<>
			<HeroHeader
				title={localPartnerTitle}
				heroImageFilename={heroImageFilename}
				heroImageAlt={heroImageAlt}
				titleIcon={isoCode ? `/assets/flags/${isoCode.toLowerCase()}.svg` : undefined}
				titleIconAlt={isoCode ? `${isoCode} flag` : undefined}
				stats={[
					{ value: recipientsCount ?? 0, label: 'Recipients' },
					{ value: completedSurveysCount ?? 0, label: 'Completed surveys' },
				]}
			/>
			<div className="max-w-content 2xl:w-site-width ml-[2vw] pl-8 2xl:mx-auto">
				<Breadcrumb links={breadcrumbLinks} />
			</div>
			<div className="w-site-width max-w-content mx-auto grid gap-8 px-6 py-8 lg:grid-cols-2 lg:items-start lg:gap-12">
				<div className="flex justify-center lg:justify-start">
					{isoCode ? <MapBubble isoCode={isoCode} countryName={isoCode} /> : null}
				</div>
				<div className="flex flex-col gap-4">
					{focuses.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{focuses.map((focusStory) => {
								const focusTitle = getFocusTitle(focusStory.content);
								const focusSlug = getFocusSlug(focusStory);

								return (
									<Link key={focusStory.uuid} href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/focuses/${focusSlug}`}>
										<Badge
											variant="outline"
											className="border-sky-300 bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100"
										>
											{focusTitle}
										</Badge>
									</Link>
								);
							})}
						</div>
					) : null}
					<h2 className="text-2xl font-semibold">{`${translator.t('local-partners-page.about')} ${localPartnerTitle}`}</h2>
					<div className="prose prose-gray max-w-none text-base">
						<RichTextRenderer richTextDocument={localPartnerDescription} />
					</div>
					{mission || partnerSince || foundingYear || location || resolvedExternalLinks.length > 0 ? (
						<div className="mt-2 rounded-2xl border border-slate-200 bg-white p-6">
							<div className="grid gap-6 lg:grid-cols-2">
								{mission ? (
									<div className="lg:col-span-2">
										<p className="text-sm font-semibold text-slate-600">Mission</p>
										<p className="mt-2 text-base text-slate-900">{mission}</p>
									</div>
								) : null}

								<div className="space-y-3">
									{partnerSince ? (
										<div className="flex items-baseline justify-between gap-4">
											<p className="text-sm text-slate-600">Partner since</p>
											<p className="text-sm font-medium text-slate-900">{partnerSince}</p>
										</div>
									) : null}
									{foundingYear ? (
										<div className="flex items-baseline justify-between gap-4">
											<p className="text-sm text-slate-600">Founded</p>
											<p className="text-sm font-medium text-slate-900">{foundingYear}</p>
										</div>
									) : null}
									{location ? (
										<div className="flex items-baseline justify-between gap-4">
											<p className="text-sm text-slate-600">Location</p>
											<p className="text-sm font-medium text-slate-900">{location}</p>
										</div>
									) : null}
								</div>

								{resolvedExternalLinks.length > 0 ? (
									<div>
										<p className="text-sm font-semibold text-slate-600">Online</p>
										<div className="mt-3 flex flex-wrap gap-2">
											{resolvedExternalLinks.map(({ label, href }) => (
												<Link
													key={label}
													href={href}
													target="_blank"
													rel="noopener noreferrer"
													className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
												>
													{label}
												</Link>
											))}
										</div>
									</div>
								) : null}
							</div>
						</div>
					) : null}
				</div>
			</div>
			<LocalPartnerPayoutsTotal localPartner={localPartner} lang={lang} region={region} />
			{Array.isArray(localPartner.content.testimonial)
				? localPartner.content.testimonial.map((blok: TestimonialCarousel) => (
						<TestimonialCarouselBlock key={blok._uid} blok={blok} />
					))
				: null}
			<LocalPartnerPrograms localPartner={localPartner} lang={lang} region={region} />
			<LocalPartnerPartners localPartner={localPartner} lang={lang} region={region} />
		</>
	);
};
