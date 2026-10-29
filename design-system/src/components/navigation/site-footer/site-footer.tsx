import NextImage from 'next/image';
import NextLink from 'next/link';
import { type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { type WithoutClassName } from '../../../without-class-name';
import { SocialIncomeLogo } from '../../brand/logo/logo';
import { ContactIcon, PaperPlaneIcon } from '../../icons/custom-icons/custom-icons';
import {
	AppStoreIcon,
	FacebookIcon,
	GithubIcon,
	GooglePlayIcon,
	InstagramIcon,
	LinkedinIcon,
	StripeIcon,
	YoutubeIcon,
} from '../../icons/social-icons/social-icons';

const footerIcons = {
	instagram: InstagramIcon,
	linkedin: LinkedinIcon,
	facebook: FacebookIcon,
	github: GithubIcon,
	newsletter: PaperPlaneIcon,
	contact: ContactIcon,
	googleplay: GooglePlayIcon,
	appstore: AppStoreIcon,
	youtube: YoutubeIcon,
	stripe: StripeIcon,
} satisfies Record<string, ComponentType>;

export type SiteFooterIcon = keyof typeof footerIcons;

export type SiteFooterLink = {
	id: string;
	label?: string;
	href: string;
	newTab?: boolean;
	icon?: SiteFooterIcon;
};

export type SiteFooterGroup = {
	id: string;
	label: string;
	links: SiteFooterLink[];
};

export type SiteFooterSupportedBy = {
	label: string;
	logoSrc: string;
	logoAlt?: string | null;
	link?: {
		href: string;
		target?: string;
		ariaLabel: string;
	};
};

type SiteFooterProps = {
	groups: SiteFooterGroup[];
	copyright?: string;
	supportedBy?: SiteFooterSupportedBy;
	/** Shown next to the copyright, e.g. a `SiteFooterButton` to reopen the cookie settings. */
	legal?: ReactNode;
};

export const SiteFooterButton = (props: WithoutClassName<ComponentProps<'button'>>) => (
	<button
		type="button"
		className="text-primary-foreground/60 hover:text-primary-foreground focus-visible:ring-ring rounded-sm text-xs font-medium underline-offset-4 transition-colors hover:underline focus-visible:ring-1 focus-visible:outline-hidden"
		{...props}
	/>
);

const Legal = ({ copyright, legal }: Pick<SiteFooterProps, 'copyright' | 'legal'>) => (
	<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
		{copyright && <p className="text-primary-foreground/60 text-xs font-medium">{copyright}</p>}
		{legal}
	</div>
);

const SupportedBy = ({ label, logoSrc, logoAlt, link }: SiteFooterSupportedBy) => (
	<div className="mt-8 flex flex-col gap-2 lg:col-start-1 lg:row-start-2 lg:mt-auto">
		<p className="text-primary-foreground/60 text-xs leading-normal font-medium">{label}</p>
		{link ? (
			<NextLink
				href={link.href}
				target={link.target}
				rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
				className="w-fit"
				aria-label={link.ariaLabel}
			>
				<NextImage src={logoSrc} alt="" width={120} height={22} />
			</NextLink>
		) : (
			<NextImage src={logoSrc} alt={logoAlt ?? label} width={120} height={22} />
		)}
	</div>
);

export const SiteFooter = ({ groups, copyright, supportedBy, legal }: SiteFooterProps) => (
	<div className="bg-primary text-primary-foreground max-w-content mx-auto grid w-full grid-cols-1 gap-4 rounded-t-3xl px-8 pt-10 pb-8 sm:px-16 sm:pt-14 lg:grid-cols-[334px_auto] lg:grid-rows-[auto_1fr]">
		<div className="order-1 lg:col-start-1 lg:row-start-1">
			<SocialIncomeLogo width={222} height={22} />
		</div>
		<div className="order-2 mt-8 flex flex-col lg:contents">
			<div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-16">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
					{groups.map((group) => (
						<div key={group.id}>
							<h2 className="text-primary-foreground text-lg font-bold">{group.label}</h2>
							<ul className="mt-4 space-y-3">
								{group.links.map((link) => {
									const Icon = link.icon ? footerIcons[link.icon] : null;

									return (
										<li key={link.id}>
											<NextLink
												href={link.href}
												target={link.newTab ? '_blank' : '_self'}
												rel={link.newTab ? 'noopener noreferrer' : undefined}
												className="text-primary-foreground/60 hover:text-primary-foreground flex items-center gap-3 font-medium transition-colors"
											>
												{Icon && (
													<span className="text-input">
														<Icon />
													</span>
												)}
												{link.label}
											</NextLink>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</div>
				{(copyright !== undefined || legal !== undefined) && (
					<div className="mt-16 max-lg:hidden">
						<Legal copyright={copyright} legal={legal} />
					</div>
				)}
			</div>
			{supportedBy && <SupportedBy {...supportedBy} />}
			{(copyright !== undefined || legal !== undefined) && (
				<div className="mt-16 lg:hidden">
					<Legal copyright={copyright} legal={legal} />
				</div>
			)}
		</div>
	</div>
);
