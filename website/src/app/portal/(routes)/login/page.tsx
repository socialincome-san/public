import { Button } from '@/app/portal/components/button';
import Link from 'next/link';

export default async function Page() {
	return (
		<div className="flex min-h-screen items-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
			<div className="w-full space-y-6 text-center">
				<p className="text-gradient animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-2xl font-semibold text-transparent">
					🚀 Coming Soon!
				</p>
				<Button asChild>
					<Link href="/login" prefetch={false}>
						Use the website login and return here
					</Link>
				</Button>
			</div>
		</div>
	);
}
