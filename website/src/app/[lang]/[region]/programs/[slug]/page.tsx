import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { loadProgramDetailData, type ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { formatStoryblokUrlDirect } from '@/lib/services/storyblok/storyblok.utils';
import { getMetadata } from '@/lib/utils/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

export const revalidate = 900;

const PROGRAM_METADATA_IMAGE_WIDTH = 1200;
const PROGRAM_METADATA_IMAGE_HEIGHT = 630;

const getProgramDetailData = cache(loadProgramDetailData);

const getProgramMetadataImage = (programDetailData: ProgramDetailData) => {
	const heroImage = programDetailData.heroImage;
	if (!heroImage?.filename) {
		return undefined;
	}

	return {
		url: formatStoryblokUrlDirect(
			heroImage.filename,
			PROGRAM_METADATA_IMAGE_WIDTH,
			PROGRAM_METADATA_IMAGE_HEIGHT,
			heroImage.focus,
		),
		width: PROGRAM_METADATA_IMAGE_WIDTH,
		height: PROGRAM_METADATA_IMAGE_HEIGHT,
		alt: heroImage.alt || programDetailData.title,
	};
};

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug): Promise<Metadata> => {
	const { slug, lang } = await params;
	const programDetailData = await getProgramDetailData(slug, lang);

	if (!programDetailData) {
		return getMetadata(lang as WebsiteLanguage, 'website-common');
	}

	const description = programDetailData.description;
	const image = getProgramMetadataImage(programDetailData);

	return getMetadata(lang as WebsiteLanguage, 'website-common', {
		title: programDetailData.title,
		...(description ? { description } : {}),
		openGraph: {
			title: programDetailData.title,
			...(description ? { description } : {}),
			...(image ? { images: image } : {}),
		},
		twitter: {
			title: programDetailData.title,
			...(description ? { description } : {}),
			...(image ? { images: image } : {}),
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
