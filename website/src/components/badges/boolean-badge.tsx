import { Badge } from '@/components/badge';

type Props = {
  value: boolean;
};

export const BooleanBadge = ({ value }: Props) => {
  return <Badge variant={value ? 'verified' : 'destructive'}>{value ? 'Yes' : 'No'}</Badge>;
};
