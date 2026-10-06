import type { RoleSpotlight } from '@/components/behind-the-scenes/behind-the-scenes-data';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import Image from 'next/image';
import Link from 'next/link';

const AVATAR_SIZE = 44;

type Props = {
	spotlights: RoleSpotlight[];
	/** Visible text on the contact button, identical for everyone. */
	contactAction: string;
	contactLabel: (spotlight: RoleSpotlight) => string;
	personHref: (slug: string) => string;
};

/**
 * The roles this site is built from, each shown through one of the real people who fills it.
 *
 * Roles lead and the person follows, because who did which page is not recorded anywhere and
 * claiming it would be invention. What is recorded, evenly and for everyone, is the role — so the
 * role is the fact on the page and the person is a genuine example of someone doing it.
 */
export const BehindTheScenesRoles = ({ spotlights, contactAction, contactLabel, personHref }: Props) => (
	<ul className="flex flex-col">
		{spotlights.map((spotlight) => {
			const { person, roleKey, roleLabel, contactUrl } = spotlight;
			const avatar = person.content.avatar;
			const src = avatar?.filename ? formatStoryblokUrl(avatar.filename, AVATAR_SIZE, AVATAR_SIZE, avatar.focus) : null;

			return (
				<li
					key={roleKey}
					className="border-border/60 flex items-center gap-4 border-b py-3 first:pt-0 last:border-b-0 last:pb-0"
				>
					{src ? (
						<Image
							src={src}
							alt=""
							width={AVATAR_SIZE}
							height={AVATAR_SIZE}
							className="size-11 shrink-0 rounded-full object-cover"
						/>
					) : (
						<span className="bg-muted size-11 shrink-0 rounded-full" />
					)}
					<span className="flex min-w-0 flex-1 flex-col gap-0.5">
						<span className="text-foreground text-base font-medium">{roleLabel}</span>
						<Link href={personHref(person.slug)} className="text-muted-foreground text-base hover:underline">
							{person.content.fullName}
						</Link>
					</span>
					{/*
					 * A named action rather than an arrow to a profile: the point is to reach the person who
					 * does this work, and "open their page" asks the reader to go hunting for a way in. It
					 * sits inside the row's existing height, so the invitation costs width but never a line.
					 *
					 * The channel is whichever one they have and is never named, so nobody reads as more
					 * reachable than anybody else.
					 */}
					{contactUrl ? (
						<span className="shrink-0">
							<Button asChild variant="outline" size="sm">
								<Link href={contactUrl} target="_blank" rel="noopener noreferrer" aria-label={contactLabel(spotlight)}>
									{contactAction}
								</Link>
							</Button>
						</span>
					) : null}
				</li>
			);
		})}
	</ul>
);
