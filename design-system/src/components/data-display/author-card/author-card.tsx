import { ArrowRight } from 'lucide-react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { Fragment } from 'react';
import { cn } from '../../../cn';
import { Button } from '../../actions/button/button';
import { Stat } from '../stat/stat';

type AuthorCardLink = {
	label: string;
	href: string;
};

type AuthorCardFact = { label: string; value: string } | { label: string; links: AuthorCardLink[] };

type AuthorCardProps = {
	name: string;
	href: string;
	image?: { src: string; alt: string } | null;
	// Reads "Author (12 articles) · Program Lead": the count links to all their articles
	subtitle?: { label: string; count?: AuthorCardLink; detail?: string };
	description?: string;
	facts?: AuthorCardFact[];
	actionLabel: string;
};

const linkClassName = 'underline decoration-border underline-offset-4 transition-colors hover:decoration-current';

export const AuthorCard = ({ name, href, image, subtitle, description, facts, actionLabel }: AuthorCardProps) => (
	// On phones the portrait sits next to the name, and the rest runs below at full width
	<section className="bg-card shadow-card grid grid-cols-[6rem_minmax(0,1fr)] gap-x-5 gap-y-5 rounded-3xl p-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-8 sm:p-8">
		{image ? (
			// The name and the action already link here, so the portrait stays out of the tab order
			<NextLink
				href={href}
				tabIndex={-1}
				aria-hidden
				className="bg-muted relative block aspect-4/5 w-full self-start overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] sm:row-span-2"
			>
				<NextImage src={image.src} alt={image.alt} fill sizes="128px" className="object-cover object-top" />
			</NextLink>
		) : null}

		<div className={cn('flex min-w-0 flex-col gap-1 self-center sm:self-start', !image && 'col-span-2')}>
			<h2 className="text-2xl font-bold">
				<NextLink href={href} className="underline-offset-4 hover:underline">
					{name}
				</NextLink>
			</h2>
			{subtitle ? (
				<p className="text-muted-foreground">
					{subtitle.label}
					{subtitle.count ? (
						<>
							{' ('}
							<NextLink href={subtitle.count.href} className={linkClassName}>
								{subtitle.count.label}
							</NextLink>
							{')'}
						</>
					) : null}
					{subtitle.detail ? ` · ${subtitle.detail}` : null}
				</p>
			) : null}
		</div>

		<div className={cn('col-span-2 flex min-w-0 flex-col gap-5', image && 'sm:col-span-1 sm:col-start-2')}>
			{description ? <p className="text-foreground line-clamp-4 leading-relaxed">{description}</p> : null}

			{facts && facts.length > 0 ? (
				<div className="flex flex-wrap gap-x-10 gap-y-3">
					{facts.map((fact) => (
						<Stat
							key={fact.label}
							label={fact.label}
							value={
								'links' in fact
									? fact.links.map((link, index) => (
											<Fragment key={link.href}>
												{index > 0 ? ', ' : null}
												<NextLink href={link.href} className={linkClassName}>
													{link.label}
												</NextLink>
											</Fragment>
										))
									: fact.value
							}
						/>
					))}
				</div>
			) : null}

			<div>
				<Button asChild variant="outline" size="sm">
					<NextLink href={href}>
						{actionLabel}
						<ArrowRight aria-hidden />
					</NextLink>
				</Button>
			</div>
		</div>
	</section>
);
