import { BehindTheScenesCollapsibleCard } from '@/components/behind-the-scenes/behind-the-scenes-collapsible-card';
import type { ResolvedMaintainer } from '@/components/behind-the-scenes/behind-the-scenes-data';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import Image from 'next/image';
import Link from 'next/link';

const FACE_SIZE = 36;
const ROLE_FACE_SIZE = 36;
/** Faces and names shown in the collapsed row before the rest becomes a +N. */
const SUMMARY_LIMIT = 3;
const ROLE_PERSON_LIMIT = 3;

type Props = {
	maintainers: ResolvedMaintainer[];
	labels: {
		showMore: string;
		showLess: string;
		more: (count: number) => string;
		mistake: string;
		reachOut: string;
		reachOutAria: (name: string) => string;
	};
	personHref: (slug: string) => string;
};

/**
 * Who is answerable for this page.
 *
 * Distinct from the role spotlight further down: that one asks the reader which role they might
 * fill, this one says who already fills it here. Hence one shared contact at the foot rather than
 * a button per row — there is a single thing to do with this card, and it is report a mistake.
 */
export const BehindTheScenesPageCredits = ({ maintainers, labels, personHref }: Props) => {
	const shown = maintainers.slice(0, SUMMARY_LIMIT);
	const remaining = maintainers.length - shown.length;
	const names = shown.map(({ person }) => person.content.fullName.split(' ')[0]).join(', ');
	const groupedByRole = new Map<string, { roleLabel: string; people: ResolvedMaintainer[] }>();
	maintainers.forEach((maintainer) => {
		const group = groupedByRole.get(maintainer.roleKey);
		if (group) {
			group.people.push(maintainer);
		} else {
			groupedByRole.set(maintainer.roleKey, { roleLabel: maintainer.roleLabel, people: [maintainer] });
		}
	});
	// The first entry is the page's primary contact, the way the CMS list is ordered.
	const primary = maintainers[0];

	return (
		<BehindTheScenesCollapsibleCard
			showMoreLabel={labels.showMore}
			showLessLabel={labels.showLess}
			summary={
				<span className="flex min-w-0 items-center gap-3">
					<span className="flex shrink-0">
						{shown.map(({ person }) => {
							const avatar = person.content.avatar;
							const src = avatar?.filename ? formatStoryblokUrl(avatar.filename, FACE_SIZE, FACE_SIZE, avatar.focus) : null;

							return src ? (
								<Image
									key={person.uuid}
									src={src}
									alt=""
									width={FACE_SIZE}
									height={FACE_SIZE}
									className="border-card -mr-2 size-9 rounded-full border-2 object-cover last:mr-0"
								/>
							) : null;
						})}
					</span>
					<span className="text-foreground min-w-0 truncate text-base">
						{names}
						{remaining > 0 ? ` ${labels.more(remaining)}` : ''}
					</span>
				</span>
			}
		>
			<ul className="border-border/60 flex flex-col border-t pt-2">
				{[...groupedByRole.entries()].map(([roleKey, group]) => {
					const people = group.people.slice(0, ROLE_PERSON_LIMIT);

					return (
						<li key={roleKey} className="flex items-center justify-between gap-4 py-2">
							<span className="flex min-w-0 flex-col gap-0.5">
								<span className="text-foreground text-base font-medium">{group.roleLabel}</span>
								<span className="text-muted-foreground text-base">
									{people.map(({ person }, index) => (
										<span key={person.uuid}>
											{index > 0 ? ', ' : null}
											<Link href={personHref(person.slug)} className="hover:underline">
												{person.content.fullName}
											</Link>
										</span>
									))}
								</span>
							</span>
							<span className="flex w-[5.75rem] shrink-0 justify-end">
								{people.map(({ person }) => {
									const avatar = person.content.avatar;
									const src = avatar?.filename
										? formatStoryblokUrl(avatar.filename, ROLE_FACE_SIZE, ROLE_FACE_SIZE, avatar.focus)
										: null;

									return src ? (
										<Image
											key={person.uuid}
											src={src}
											alt=""
											width={ROLE_FACE_SIZE}
											height={ROLE_FACE_SIZE}
											className="border-card -mr-2 size-9 rounded-full border-2 object-cover last:mr-0"
										/>
									) : null;
								})}
							</span>
						</li>
					);
				})}
			</ul>

			{primary?.contactUrl ? (
				<div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
					<span className="text-foreground text-base">{labels.mistake}</span>
					<span className="shrink-0">
						<Button asChild variant="outline" size="sm">
							<Link
								href={primary.contactUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={labels.reachOutAria(primary.person.content.fullName)}
							>
								{labels.reachOut}
							</Link>
						</Button>
					</span>
				</div>
			) : null}
		</BehindTheScenesCollapsibleCard>
	);
};
