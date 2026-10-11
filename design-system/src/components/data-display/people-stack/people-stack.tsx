'use client';

import NextLink from 'next/link';
import { useId, useState } from 'react';
import { AvatarStack } from '../avatar-stack/avatar-stack';
import { type Contributor } from '../contributors-card/contributors-card';

type PeopleStackProps = {
	people: Contributor[];
	visibleCount?: number;
	moreLabel: string;
	lessLabel: string;
};

export const PeopleStack = ({ people, visibleCount = 3, moreLabel, lessLabel }: PeopleStackProps) => {
	const listId = useId();
	const [expanded, setExpanded] = useState(false);
	const hasMore = people.length > visibleCount;

	const toggle = hasMore ? (
		<button
			type="button"
			onClick={() => setExpanded((value) => !value)}
			aria-expanded={expanded}
			aria-controls={listId}
			className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
		>
			{expanded ? lessLabel : moreLabel}
		</button>
	) : null;

	if (expanded) {
		return (
			<div className="flex flex-col items-start gap-3">
				<ul id={listId} className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
					{people.map((person) => (
						<li key={person.name} className="flex min-w-0 items-center gap-2">
							<AvatarStack people={[person]} size="sm" />
							{person.href ? (
								<NextLink href={person.href} className="text-foreground truncate text-sm hover:underline">
									{person.name}
								</NextLink>
							) : (
								<span className="text-foreground truncate text-sm">{person.name}</span>
							)}
						</li>
					))}
				</ul>
				{toggle}
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<AvatarStack people={people.slice(0, visibleCount)} />
			{toggle}
		</div>
	);
};
