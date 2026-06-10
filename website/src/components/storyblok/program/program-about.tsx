import type { ProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import type { ProgramDetailLabels } from '@/components/storyblok/program/program-detail-labels';
import { ProgramDetailPill } from '@/components/storyblok/program/program-detail-pill';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import Link from 'next/link';

type DetailRow = {
	label: string;
	value: string;
	href?: string;
};

type Props = {
	programDetailData: ProgramDetailData;
	labels: ProgramDetailLabels;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramAbout = ({ programDetailData, labels, lang, region }: Props) => {
	const { description, programDetails, dashboardStats } = programDetailData;

	if (!programDetails) {
		return null;
	}
	const durationMonths = dashboardStats?.programDurationInMonths ?? programDetails.programDurationInMonths;
	const localPartnerHref = programDetails.localPartnerSlug
		? `/${lang}/${region}/${NEW_WEBSITE_SLUG}/local-partners/${programDetails.localPartnerSlug}`
		: undefined;

	const details: DetailRow[] = [];

	if (programDetails.ownerOrganizationName) {
		details.push({ label: labels.programOwner, value: programDetails.ownerOrganizationName });
	}

	if (programDetails.localPartnerName) {
		details.push({
			label: labels.localProgramOwner,
			value: programDetails.localPartnerName,
			href: localPartnerHref,
		});
	}

	if (programDetails.operatorOrganizationName) {
		details.push({
			label: labels.programOperator,
			value: programDetails.operatorOrganizationName,
		});
	}

	details.push({
		label: labels.duration,
		value: `${durationMonths} ${durationMonths === 1 ? labels.monthSingular : labels.monthPlural}`,
	});

	if (programDetails.startedAt) {
		details.push({
			label: labels.startDate,
			value: new Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric', year: 'numeric' }).format(
				programDetails.startedAt,
			),
		});
	}

	return (
		<div className="flex flex-col gap-6 rounded-xl bg-white px-10 pt-8 pb-10 shadow-lg">
			<div className="flex items-center justify-between">
				<h2 className="text-foreground text-xl font-bold">{labels.aboutTitle}</h2>
				<ProgramDetailPill label={labels.viewDetails} />
			</div>

			{description ? <p className="text-foreground text-base">{description}</p> : null}

			<dl className="flex flex-col gap-1 text-base">
				{details.map((row) => (
					<div key={row.label} className="grid grid-cols-2 gap-2">
						<dt className="font-bold">{row.label}</dt>
						<dd>
							{row.href ? (
								<Link href={row.href} className="hover:underline">
									{row.value}
								</Link>
							) : (
								row.value
							)}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};
