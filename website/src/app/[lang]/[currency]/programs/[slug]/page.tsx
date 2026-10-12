import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { loadProgramDetailData, type ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { formatStoryblokUrlDirect } from '@/lib/storyblok/storyblok-utils';
import { getMetadata, getWebsiteAlternates } from '@/lib/utils/metadata';
import { DEFAULT_OPEN_GRAPH_IMAGE_URL, toProductionMetadataImage } from '@/lib/utils/metadata-image';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

const PROGRAM_METADATA_IMAGE_WIDTH = 1200;
const PROGRAM_METADATA_IMAGE_HEIGHT = 630;

const getProgramDetailData = cache(loadProgramDetailData);

const getProgramMetadataImage = ({ heroImage, title }: ProgramDetailData) =>
	toProductionMetadataImage(
		heroImage?.filename
			? {
					url: formatStoryblokUrlDirect(
						heroImage.filename,
						PROGRAM_METADATA_IMAGE_WIDTH,
						PROGRAM_METADATA_IMAGE_HEIGHT,
						heroImage.focus,
					),
					width: PROGRAM_METADATA_IMAGE_WIDTH,
					height: PROGRAM_METADATA_IMAGE_HEIGHT,
					alt: heroImage.alt?.trim() ? heroImage.alt : title,
				}
			: undefined,
		DEFAULT_OPEN_GRAPH_IMAGE_URL,
	);

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug): Promise<Metadata> => {
	const { lang, slug } = await params;
	const alternates = getWebsiteAlternates(lang as WebsiteLanguage, `programs/${slug}`);
	const programDetailData = await getProgramDetailData(slug, lang);
	if (!programDetailData) {
		return alternates;
	}

	const { title, description } = programDetailData;
	const images = getProgramMetadataImage(programDetailData);
	const metadata = await getMetadata(lang as WebsiteLanguage, 'website-common', {
		title,
		...(description ? { description } : {}),
		openGraph: { title, ...(description ? { description } : {}), images },
		twitter: { title, ...(description ? { description } : {}), images },
	});

	return { ...metadata, ...alternates };
};

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, currency } = await params;
	const programDetailData = await getProgramDetailData(slug, lang);
	if (!programDetailData) {
		return notFound();
	}

	const communityResult = await getCommunityPanelData(
		programDetailData.communityPage ?? {},
		lang,
		toWebsiteCurrency(currency),
	);

	return (
		<ProgramDetail
			programDetailData={programDetailData}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}
