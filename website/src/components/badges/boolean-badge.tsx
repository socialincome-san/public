import { Badge } from '@/components/badge';

type Props = {
	value: boolean;
};

export function BooleanBadge({ value }: Props) {
	return <Badge variant={value ? 'verified' : 'destructive'}>{value ? 'Yes' : 'No'}</Badge>;
}
