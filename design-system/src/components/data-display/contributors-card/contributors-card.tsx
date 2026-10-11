'use client';

import { ChevronDown } from 'lucide-react';
import NextLink from 'next/link';
import { Fragment, useId, useState, type ReactNode } from 'react';
import { cn } from '../../../cn';
import { AvatarStack, type AvatarStackPerson } from '../avatar-stack/avatar-stack';

export type Contributor = AvatarStackPerson & {
	href?: string;
};

export type ContributorRole = {
	label: string;
	people: Contributor[];
};

type ContributorsCardProps = {
	roles: ContributorRole[];
	showMoreLabel: string;
	showLessLabel: string;
	footer?: ReactNode;
};

const SUMMARY_LIMIT = 3;

const uniqueByName = (people: Contributor[]) => [...new Map(people.map((person) => [person.name, person])).values()];

export const ContributorsCard = ({ roles, showMoreLabel, showLessLabel, footer }: ContributorsCardProps) => {
	const contentId = useId();
	const [expanded, setExpanded] = useState(false);
	const everyone = uniqueByName(roles.flatMap((role) => role.people));
	const summaryPeople = everyone.slice(0, SUMMARY_LIMIT);
	const hiddenCount = everyone.length - summaryPeople.length;

	return (
		<div className="bg-card flex flex-col rounded-3xl shadow-lg">
			<button
				type="button"
				onClick={() => setExpanded((value) => !value)}
				aria-expanded={expanded}
				aria-controls={contentId}
				className="group focus-visible:ring-ring flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-4 text-left focus-visible:ring-2 focus-visible:outline-none"
			>
				<span className="flex min-w-0 items-center gap-3">
					<AvatarStack people={summaryPeople} />
					<span className="text-foreground min-w-0 truncate text-base">
						{summaryPeople.map((person) => person.name.split(' ')[0]).join(', ')}
						{hiddenCount > 0 ? ` +${hiddenCount}` : null}
					</span>
				</span>
				<span className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors">
					<ChevronDown
						className={cn('size-5 transition-transform motion-reduce:transition-none', expanded && 'rotate-180')}
						aria-hidden="true"
					/>
					<span className="sr-only">{expanded ? showLessLabel : showMoreLabel}</span>
				</span>
			</button>
			{expanded ? (
				<div id={contentId} className="flex flex-col gap-4 px-6 pb-4">
					<ul className="border-border flex flex-col border-t pt-2">
						{roles.map((role) => (
							<li key={role.label} className="flex items-center gap-4 py-2">
								<span className="flex w-23 shrink-0">
									<AvatarStack people={role.people} />
								</span>
								<span className="flex min-w-0 flex-col gap-0.5">
									<span className="text-foreground text-base font-medium">{role.label}</span>
									<span className="text-muted-foreground text-base">
										{role.people.map((person, index) => (
											<Fragment key={person.name}>
												{index > 0 ? ', ' : null}
												{person.href ? (
													<NextLink href={person.href} className="hover:text-foreground hover:underline">
														{person.name}
													</NextLink>
												) : (
													person.name
												)}
											</Fragment>
										))}
									</span>
								</span>
							</li>
						))}
					</ul>
					{footer ? <div className="border-border border-t pt-4">{footer}</div> : null}
				</div>
			) : null}
		</div>
	);
};
