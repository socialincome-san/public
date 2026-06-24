import { Button } from '@/components/button';
import { NotFound } from '@/components/not-found';
import Link from 'next/link';

export default function WebsiteNotFound() {
	return (
		<NotFound title="We could not find that page" description="The page may have moved, or the link may no longer be valid.">
			<Button asChild>
				<Link href="/">Go to homepage</Link>
			</Button>
		</NotFound>
	);
}
