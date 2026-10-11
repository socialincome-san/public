import { ImpactMeasurementView } from '@/app/[lang]/[currency]/programs/impact-measurement/view';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteBasePath } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import Link from 'next/link';

type Props = {
	focusId: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	teaserButtonLabel?: string;
	teaserText?: string;
};

export const ImpactMeasurementPreviewWrapper = ({ focusId, lang, currency, teaserButtonLabel, teaserText }: Props) => {
	const trimmedTeaserText = teaserText?.trim();
	const trimmedTeaserButtonLabel = teaserButtonLabel?.trim();
	const hasTeaser = [trimmedTeaserText, trimmedTeaserButtonLabel].some(Boolean);

	return (
		<div className={hasTeaser ? 'relative pb-24 sm:pb-16' : undefined}>
			<div className="bg-card after:bg-card shadow-card relative h-96 overflow-hidden rounded-3xl after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-1/2 after:mask-[linear-gradient(to_bottom,transparent_0%,black_100%)] after:backdrop-blur-[100px] after:content-[''] after:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]">
				<div className="-mx-6">
					<ImpactMeasurementView lang={lang} searchParams={{ focus: focusId }} showStudyDetails={false} variant="embedded" />
				</div>
			</div>

			{hasTeaser && (
				<div className="bg-card shadow-overlay absolute inset-x-4 bottom-24 mx-auto flex max-w-3xl translate-y-1/2 flex-col gap-4 rounded-3xl p-6 sm:bottom-16 sm:flex-row sm:items-center sm:justify-between sm:gap-16 sm:p-10">
					{trimmedTeaserText && (
						<p className="text-foreground min-w-0 text-center text-xl font-bold sm:text-left">{trimmedTeaserText}</p>
					)}
					{trimmedTeaserButtonLabel && (
						<Button variant="outline" size="lg" asChild>
							<Link
								href={{ pathname: `${getWebsiteBasePath(lang, currency)}/impact-measurement`, query: { focus: focusId } }}
							>
								{trimmedTeaserButtonLabel}
							</Link>
						</Button>
					)}
				</div>
			)}
		</div>
	);
};
