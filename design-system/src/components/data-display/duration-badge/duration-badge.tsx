import { Badge } from '../badge/badge';

type DurationBadgeProps = {
	label: string;
	// Replaces the label on hover, e.g. the start date
	since: string;
};

export const DurationBadge = ({ label, since }: DurationBadgeProps) => (
	<div className="group/duration">
		<Badge
			variant="frosted"
			// The hover-only date is exposed via title; an aria-label would replace the duration as the accessible name
			title={since}
		>
			<span className="group-hover/duration:hidden">{label}</span>
			<span className="hidden group-hover/duration:inline">{since}</span>
		</Badge>
	</div>
);
