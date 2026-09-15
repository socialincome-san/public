import type { LocalPartnerProgramSummary } from '@/lib/storyblok/local-partner-programs';
import { cn } from '@/lib/utils/cn';
import { ChevronRight } from 'lucide-react';
import NextLink from 'next/link';

/**
 * Miniature of the program cards on the programs overview: the same left-to-right card gradient, the same white
 * typography and the same labelled stat column, scaled to a row.
 */
const rowClass = cn(
	'from-[hsl(var(--gradient-card-from))] to-[hsl(var(--gradient-card-to))] bg-gradient-to-r',
	'text-primary-foreground flex h-full min-w-0 items-center gap-3 rounded-xl py-1.5 pl-5 pr-3',
	'transition-all hover:-translate-y-0.5 hover:shadow-md',
	'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-hidden',
);

type Props = {
	program: LocalPartnerProgramSummary;
	href: string;
	/** Count and noun in one line, e.g. "9 recipients". */
	recipientsLabel: string;
	fundraisingLabel: string;
};

export const LocalPartnerProgramRow = ({ program, href, recipientsLabel, fundraisingLabel }: Props) => (
	<li className="min-h-0">
		<NextLink href={href} className={rowClass} data-testid={`local-partner-program-${program.storyblokSlug}`}>
			<span className="flex min-w-0 flex-1 flex-col gap-1">
				<span className="truncate text-lg leading-tight font-medium" title={program.title}>
					{program.title}
				</span>
				<span className="text-primary-foreground/80 truncate text-xs leading-4">
					{[recipientsLabel, program.isFundraising ? fundraisingLabel : null].filter(Boolean).join(' · ')}
				</span>
			</span>
			<ChevronRight className="text-primary-foreground size-5 shrink-0" strokeWidth={2.5} aria-hidden />
		</NextLink>
	</li>
);
