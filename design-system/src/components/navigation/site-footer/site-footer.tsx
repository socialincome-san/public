import NextImage from 'next/image';
import NextLink from 'next/link';
import { type ComponentType } from 'react';
import { SocialIncomeLogo } from '../../brand/logo/logo';
import { ContactIcon, PaperPlaneIcon } from '../../icons/custom-icons/custom-icons';
import {
	AppStoreIcon,
	FacebookIcon,
	GithubIcon,
	GooglePlayIcon,
	InstagramIcon,
	LinkedinIcon,
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
};

const Copyright = ({ text }: { text: string }) => <p className="text-primary-foreground/50 text-xs font-medium">{text}</p>;

const SupportedBy = ({ label, logoSrc, logoAlt, link }: SiteFooterSupportedBy) => (
	<div className="mt-8 flex flex-col gap-2 lg:col-start-1 lg:row-start-2 lg:mt-auto">
		<p className="text-primary-foreground/50 text-xs leading-normal font-medium">{label}</p>
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

export const SiteFooter = ({ groups, copyright, supportedBy }: SiteFooterProps) => (
	<div className="bg-primary text-primary-foreground max-w-content mx-auto grid w-full grid-cols-1 gap-4 rounded-t-3xl px-8 pt-10 pb-8 sm:px-16 sm:pt-14 lg:mb-10 lg:grid-cols-[334px_auto] lg:grid-rows-[auto_1fr] lg:rounded-3xl">
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
												className="text-primary-foreground/50 hover:text-primary-foreground flex items-center gap-3 font-medium transition-colors"
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
				{copyright && (
					<div className="mt-16 max-lg:hidden">
						<Copyright text={copyright} />
					</div>
				)}
			</div>
			{supportedBy && <SupportedBy {...supportedBy} />}
			{copyright && (
				<div className="mt-16 lg:hidden">
					<Copyright text={copyright} />
				</div>
			)}
		</div>
	</div>
);
