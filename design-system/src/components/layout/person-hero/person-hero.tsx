import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '../../../cn';
import { Button } from '../../actions/button/button';
import { Badge } from '../../data-display/badge/badge';
import { CountryFlag } from '../../data-display/country-flag/country-flag';
import { StatusDot } from '../../feedback/status-dot/status-dot';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../overlays/tool-tip/tool-tip';
import { heroDescriptionVariants, HeroShell, heroTitleVariants } from '../hero-shell/hero-shell';

type PersonHeroStat = {
	value: string;
	label: string;
	// Shown on hover, focus or tap of the label, which then gets a dotted underline
	description?: ReactNode;
};

type PersonHeroLink = {
	label: string;
	href: string;
};

type PersonHeroProps = {
	firstName: string;
	lastName?: string;
	role?: string;
	country?: { code: string; name: string };
	// Above the name, e.g. "Active volunteer" or "Former volunteer"
	status?: { label: string; variant: 'active' | 'inactive' };
	stats?: PersonHeroStat[];
	action?: PersonHeroLink;
	// External profiles, opened in a new tab
	links?: PersonHeroLink[];
	// Read out after an external link, e.g. "(opens in a new tab)"
	externalLinkLabel?: string;
	// Beside the text on large screens and above it on small ones, e.g. PersonCircles
	visual: ReactNode;
	// Below a hairline at the bottom of the hero, e.g. PersonNav
	footer?: ReactNode;
};

const PersonHeroStats = ({ stats }: { stats: PersonHeroStat[] }) => (
	<dl className="flex flex-wrap justify-center gap-x-10 gap-y-5 text-center lg:justify-start lg:text-left">
		{stats.map((stat) => (
			<div key={stat.label} className="flex flex-col-reverse gap-1">
				<dt className="text-primary-foreground/75 text-sm">
					{stat.description ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="decoration-primary-foreground/50 hover:text-primary-foreground focus-visible:ring-primary-foreground cursor-help rounded-xs underline decoration-dotted underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
								>
									{stat.label}
								</button>
							</TooltipTrigger>
							<TooltipContent variant="light" sideOffset={8}>
								{stat.description}
							</TooltipContent>
						</Tooltip>
					) : (
						stat.label
					)}
				</dt>
				<dd className="text-4xl leading-none font-bold">{stat.value}</dd>
			</div>
		))}
	</dl>
);

const PersonHeroStatus = ({ label, variant }: NonNullable<PersonHeroProps['status']>) => (
	<p className={cn('flex items-center gap-2 text-sm font-medium', variant === 'inactive' && 'text-primary-foreground/75')}>
		<StatusDot variant={variant === 'active' ? 'live' : 'inactive'} />
		{label}
	</p>
);

/** The dark hero of a person page: name, role and country, a few numbers, and a visual of the person. */
export const PersonHero = ({
	firstName,
	lastName,
	role,
	country,
	status,
	stats = [],
	action,
	links = [],
	externalLinkLabel,
	visual,
	footer,
}: PersonHeroProps) => (
	<HeroShell size="content">
		<div className="text-primary-foreground w-site-width max-w-content mx-auto flex flex-col gap-10 pt-24 pb-8 scheme-dark lg:gap-14 lg:pt-36 lg:pb-10">
			{/* Small screens: name, portrait, details. Large screens: name and details as wide as they need, the portrait centered in the space left */}
			<div className="grid gap-8 lg:grid-cols-[fit-content(36rem)_minmax(0,1fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-12 lg:gap-y-8">
				<div className="flex flex-col items-center gap-4 text-center lg:col-start-1 lg:row-start-2 lg:items-start lg:text-left">
					{status ? <PersonHeroStatus {...status} /> : null}
					{/* Above the portrait on small screens, first and last name on one line when they fit */}
					<h1 className={cn(heroTitleVariants({ variant: 'light' }), 'text-balance')}>
						{firstName}
						{lastName ? (
							<>
								<br className="max-lg:hidden" /> <strong>{lastName}</strong>
							</>
						) : null}
					</h1>
					{role || country ? (
						<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start">
							{role ? <p className={heroDescriptionVariants({ variant: 'light' })}>{role}</p> : null}
							{country ? (
								<Badge variant="ghost" size="lg">
									<CountryFlag country={country.code} size="inline" decorative />
									{country.name}
								</Badge>
							) : null}
						</div>
					) : null}
				</div>

				<div className="relative mx-auto w-full max-w-[34rem] self-center lg:col-start-2 lg:row-span-4 lg:row-start-1">
					{/* A soft light behind the portrait */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute -inset-[15%] bg-[radial-gradient(closest-side,hsl(var(--gradient-button-from)/0.7),transparent)]"
					/>
					<div className="relative">{visual}</div>
				</div>

				<div className="flex min-w-0 flex-col gap-8 lg:col-start-1 lg:row-start-3">
					{stats.length > 0 ? <PersonHeroStats stats={stats} /> : null}

					{action || links.length > 0 ? (
						<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 lg:justify-start">
							{action ? (
								<Button asChild variant="outline">
									<NextLink href={action.href}>{action.label}</NextLink>
								</Button>
							) : null}
							{links.map((link) => (
								<NextLink
									key={link.href}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="focus-visible:ring-primary-foreground inline-flex items-center gap-1 rounded-sm text-sm font-medium underline underline-offset-4 hover:no-underline focus-visible:ring-2 focus-visible:outline-hidden"
								>
									{link.label}
									<ArrowUpRight className="size-4" aria-hidden />
									{externalLinkLabel ? <span className="sr-only">{externalLinkLabel}</span> : null}
								</NextLink>
							))}
						</div>
					) : null}
				</div>
			</div>

			{footer ? <div className="border-primary-foreground/15 border-t pt-6">{footer}</div> : null}
		</div>
	</HeroShell>
);
