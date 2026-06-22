import { ImpactMeasurementView } from '@/app/[lang]/[region]/new-website/programs/impact-measurement/view';
import { Button } from '@/components/button';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import Link from 'next/link';

type Props = {
	focusId: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	teaserButtonLabel?: string;
	teaserText?: string;
};

export const ImpactMeasurementPreviewWrapper = ({ focusId, lang, region, teaserButtonLabel, teaserText }: Props) => {
	const trimmedTeaserText = teaserText?.trim();
	const trimmedTeaserButtonLabel = teaserButtonLabel?.trim();
	const hasTeaser = [trimmedTeaserText, trimmedTeaserButtonLabel].some(Boolean);

	return (
		<div className={hasTeaser ? 'relative pb-24 sm:pb-16' : undefined}>
			<div className="relative h-96 overflow-hidden rounded-3xl bg-white shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_0_20px_0_rgba(0,0,0,0.05)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-1/2 after:bg-white after:mask-[linear-gradient(to_bottom,transparent_0%,black_100%)] after:backdrop-blur-[100px] after:content-[''] after:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]">
				<div className="-mx-4 -my-6">
					<ImpactMeasurementView lang={lang} searchParams={{ focus: focusId }} showStudyDetails={false} variant="embedded" />
				</div>
			</div>

			{hasTeaser && (
				<div className="absolute inset-x-4 bottom-24 mx-auto flex max-w-3xl translate-y-1/2 flex-col items-stretch gap-4 rounded-[160px] bg-white px-6 py-6 shadow-[0_4px_100px_0_#dfebf2] sm:bottom-16 sm:flex-row sm:items-center sm:justify-between sm:gap-16 sm:px-12 sm:py-10">
					{trimmedTeaserText && (
						<p className="text-foreground min-w-0 text-center text-xl font-bold sm:text-left">{trimmedTeaserText}</p>
					)}
					{trimmedTeaserButtonLabel && (
						<Button variant="outline" size="lg" className="w-full shrink-0 sm:w-auto" asChild>
							<Link href={{ pathname: `/${lang}/${region}/impact-measurement`, query: { focus: focusId } }}>
								{trimmedTeaserButtonLabel}
							</Link>
						</Button>
					)}
				</div>
			)}
		</div>
	);
};
