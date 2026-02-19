import { Button } from '@/components/button';
import { NotFound as NotFoundComponent } from '@/components/not-found';
import Link from 'next/link';

export default function NotFound() {
  return (
    <NotFoundComponent>
      <Button asChild>
        <Link href="/dashboard/contributions">Return to dashboard</Link>
      </Button>
    </NotFoundComponent>
  );
}
