import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { loadProgramDetailData, type ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { formatStoryblokUrlDirect } from '@/lib/services/storyblok/storyblok.utils';
import {
	DEFAULT_OPEN_GRAPH_IMAGE_URL,
	DEFAULT_TWITTER_IMAGE_URL,
	getMetadata,
	toProductionMetadataImage,
	type MetadataImage,
} from '@/lib/utils/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

export const revalidate = 900;

const PROGRAM_METADATA_IMAGE_WIDTH = 1200;
const PROGRAM_METADATA_IMAGE_HEIGHT = 630;

const getProgramDetailData = cache(loadProgramDetailData);

const getProgramMetadataImage = (programDetailData: ProgramDetailData, fallback: string) => {
	const heroImage = programDetailData.heroImage;
	if (!heroImage?.filename) {
		return undefined;
	}

	const alt = heroImage.alt?.trim() ? heroImage.alt : programDetailData.title;
	const imageMetadata: MetadataImage = {
		url: formatStoryblokUrlDirect(
			heroImage.filename,
			PROGRAM_METADATA_IMAGE_WIDTH,
			PROGRAM_METADATA_IMAGE_HEIGHT,
			heroImage.focus,
		),
		width: PROGRAM_METADATA_IMAGE_WIDTH,
		height: PROGRAM_METADATA_IMAGE_HEIGHT,
		alt,
	};

	return toProductionMetadataImage(imageMetadata, fallback);
};

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug): Promise<Metadata> => {
	const { slug, lang } = await params;
	const programDetailData = await getProgramDetailData(slug, lang);

	if (!programDetailData) {
		return getMetadata(lang as WebsiteLanguage, 'website-common');
	}

	const description = programDetailData.description;
	const openGraphImage = getProgramMetadataImage(programDetailData, DEFAULT_OPEN_GRAPH_IMAGE_URL);
	const twitterImage = getProgramMetadataImage(programDetailData, DEFAULT_TWITTER_IMAGE_URL);

	return getMetadata(lang as WebsiteLanguage, 'website-common', {
		title: programDetailData.title,
		...(description ? { description } : {}),
		openGraph: {
			title: programDetailData.title,
			...(description ? { description } : {}),
			...(openGraphImage ? { images: openGraphImage } : {}),
		},
		twitter: {
			title: programDetailData.title,
			...(description ? { description } : {}),
			...(twitterImage ? { images: twitterImage } : {}),
		},
	});
};

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const programDetailData = await getProgramDetailData(slug, lang);
	if (!programDetailData) {
		return notFound();
	}

	return (
		<ProgramDetail programDetailData={programDetailData} lang={lang as WebsiteLanguage} region={region as WebsiteRegion} />
	);
}
