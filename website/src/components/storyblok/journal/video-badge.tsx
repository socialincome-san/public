import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils/cn';
import { PlayIcon } from 'lucide-react';

type Props = {
	label: string;
	className?: string;
};

export const VideoBadge = ({ label, className }: Props) => (
	<Badge variant="video" className={cn('gap-1', className)}>
		<PlayIcon className="h-3 w-3 fill-current" />
		{label}
	</Badge>
);
