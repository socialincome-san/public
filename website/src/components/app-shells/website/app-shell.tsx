import { Footer } from '@/components/app-shells/website/footer';
import { Navbar } from '@/components/app-shells/website/navbar/navbar';
import { Scope } from '@/components/app-shells/website/navbar/utils';
import { DonationModalProvider } from '@/components/donation-wizard/donation-modal-provider';
import type { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { HomeExplainerVideo } from '@/lib/storyblok/get-home-explainer-video';
import { ReactNode } from 'react';

type WebsiteAppShellProps = {
	children: ReactNode;
	sessions: Session[];
	lang: WebsiteLanguage;
	region: string;
	scope: Scope;
	explainerVideo?: HomeExplainerVideo | null;
};

export const WebsiteAppShell = async ({
	children,
	sessions,
	lang,
	region,
	scope,
	explainerVideo = null,
}: WebsiteAppShellProps) => {
	const isContained = scope === 'dashboard' || scope === 'partner-space';
	const communityStatsResult = await services.read.contributor.getCommunityStats();
	const communityStats = communityStatsResult.success ? communityStatsResult.data : null;

	return (
		<DonationModalProvider explainerVideo={explainerVideo} communityStats={communityStats}>
			<div className="theme-new bg-website-gradient text-primary flex min-h-screen w-full flex-col antialiased">
				<Navbar sessions={sessions} lang={lang} region={region} scope={scope} />
				<div
					className={
						isContained
							? 'w-site-width max-w-content mx-auto mt-20 flex-1 pb-8'
							: // Skip top offset when the page starts with a full-bleed hero (mark the root block with `full-bleed-hero`).
								'[&:not(:has(>.full-bleed-hero))]:mt-20'
					}
				>
					{children}
				</div>
				{scope === 'website' && <Footer lang={lang} region={region} />}
			</div>
		</DonationModalProvider>
	);
};
