import Navbar from '@/components/navbar/navbar';
import { Button, Typography } from '@socialincome/ui';
import Link from 'next/link';

export default function Page() {
	return (
		<div className="theme-blue min-h-screen">
			<Navbar lang="en" region="int" />
			<main className="text-center">
				<Typography size="5xl" weight="bold" color="primary">
					404 – Page not found
				</Typography>
				<Typography size="2xl" weight="bold" className="mt-16">
					{"We couldn't find the page you were looking for."}
				</Typography>
				<Link href="/">
					<Button variant="link">Go back to the homepage</Button>
				</Link>
			</main>
		</div>
	);
}
