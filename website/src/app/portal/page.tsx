import { Wallet } from '@/app/portal/components/custom/wallet';
import { YourPrograms } from '@/app/portal/components/custom/your-programs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/portal/components/ui/card';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';

export default async function PortalPage() {
	const user = await getAuthenticatedUserOrRedirect();

	return (
		<div>
			<h1 className="text-lg">Welcome back, {user.firstName} 👋</h1>
			<YourPrograms />

			<div className="my-8 border-2 border-red-300 p-8">
				<h1 className="text-lg">Component demo</h1>
				<div className="grid grid-cols-3 gap-4">
					<Card>
						<CardHeader>
							<CardTitle>Card Title [ Base card ]</CardTitle>
							<CardDescription>Card Description</CardDescription>
						</CardHeader>
						<CardContent>
							<p>Card Content</p>
						</CardContent>
						<CardFooter>
							<p>Card Footer</p>
						</CardFooter>
					</Card>

					<Wallet>
						<CardContent>
							<CardTitle>Empty wallet</CardTitle>
						</CardContent>
					</Wallet>

					<Wallet>
						<CardContent>
							<CardTitle>Wallet Title [ custom card ]</CardTitle>
							<p>Wallet Content</p>
						</CardContent>
					</Wallet>
				</div>
			</div>
		</div>
	);
}
