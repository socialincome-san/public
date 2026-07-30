import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { services } from '@/lib/services/services';
import { defaultLanguage } from '@/lib/i18n/utils';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export const GET = async () => {
	const programsResult = await services.storyblok.getPrograms(defaultLanguage);
	const publishedPortalSlugs =
		programsResult.success ?
			[...new Set(programsResult.data.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))]
		:	[];

	const optionsResult = await services.programPublicSubmission.getEligibleProgramOptions(publishedPortalSlugs);
	if (!optionsResult.success) {
		return NextResponse.json({ error: optionsResult.error }, { status: 503 });
	}

	return NextResponse.json({ programs: optionsResult.data });
};
