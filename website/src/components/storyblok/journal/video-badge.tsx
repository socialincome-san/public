import { Badge } from '@socialincome/design-system/badge/badge';
import { PlayIcon } from 'lucide-react';

type Props = {
	label: string;
};

export const VideoBadge = ({ label }: Props) => (
	<Badge variant="video">
		<PlayIcon className="h-3 w-3 fill-current" />
		{label}
	</Badge>
);
