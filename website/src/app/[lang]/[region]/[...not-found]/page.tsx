import Navbar from '@/components/legacy/navbar/navbar';
import { linkCn, Typography } from '@socialincome/ui';
import Link from 'next/link';

// https://stackoverflow.com/questions/77600623/not-found-page-demands-root-layout-meaning-multiple-root-layouts-not-possible
export default function Page() {
	return (
		<div className="theme-blue min-h-screen">
			<Navbar lang="en" region="int" />
			<main className="min-h-screen-navbar flex flex-col items-center justify-center space-y-4 pt-40 text-center">
				<Typography size="5xl" weight="bold" color="primary">
					404 – Page not found
				</Typography>
				<Typography size="2xl" weight="bold" className="mt-16">
					{"We couldn't find the page you were looking for."}
				</Typography>
				<Link className={linkCn()} href="/">
					Go back to the homepage
				</Link>
			</main>
		</div>
	);
}
