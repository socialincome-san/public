import { Badge } from '@/app/portal/components/ui/badge';
import { CheckIcon, CircleOffIcon, HourglassIcon, ReplyIcon } from 'lucide-react';

type Status = 'active' | 'suspended' | 'waitlisted' | 'designated' | 'former';

type StatusBadgeProps = {
	status?: Status;
};

const STATUS_UI: Record<Status, { className: string; Label: string; Icon: React.ComponentType<any> }> = {
	active: { className: 'bg-green-500 text-white', Label: 'Active', Icon: CheckIcon },
	suspended: { className: 'bg-yellow-500 text-white', Label: 'Suspended', Icon: CircleOffIcon },
	waitlisted: { className: 'bg-blue-500 text-white', Label: 'Waitlisted', Icon: HourglassIcon },
	designated: { className: 'bg-purple-500 text-white', Label: 'Designated', Icon: ReplyIcon },
	former: { className: 'bg-gray-500 text-white', Label: 'Former', Icon: CircleOffIcon },
};

export function StatusBadge({ status = 'active' }: StatusBadgeProps) {
	const { className, Label, Icon } = STATUS_UI[status];
	return (
		<Badge variant="outline" className={className}>
			<Icon className="mr-1 h-4 w-4" />
			{Label}
		</Badge>
	);
}
