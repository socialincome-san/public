import { Footer } from '@/components/app-shells/website/footer';
import { Navbar } from '@/components/app-shells/website/navbar/navbar';
import { Scope } from '@/components/app-shells/website/navbar/utils';
import { DonationModalProvider } from '@/components/donation-wizard/modal/donation-modal-provider';
import type { Session } from '@/lib/firebase/current-account';
import { ReactNode } from 'react';

type WebsiteAppShellProps = {
	children: ReactNode;
	sessions: Session[];
	scope: Scope;
};

export const WebsiteAppShell = ({ children, sessions, scope }: WebsiteAppShellProps) => {
	const isContained = scope === 'dashboard' || scope === 'partner-space';

	return (
		<DonationModalProvider>
			<div className="bg-website-gradient text-primary flex min-h-screen w-full flex-col antialiased">
				<Navbar sessions={sessions} scope={scope} />
				<main
					className={
						isContained
							? 'w-site-width max-w-content mx-auto mt-20 flex-1 overflow-x-clip pb-8'
							: 'overflow-x-clip [&:not(:has(>.full-bleed-hero))]:lg:mt-20'
					}
				>
					{children}
				</main>
				<Footer scope={scope} />
			</div>
		</DonationModalProvider>
	);
};
