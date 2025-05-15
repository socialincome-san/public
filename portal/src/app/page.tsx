import { prisma } from '@/server/prisma';

export default async function Home() {
	const users = await prisma.user.findMany()

	return (
		<div>
			<h1>Users</h1>
			<ul>
				{users.map((user) => (
					<li key={user.id}>
						{user.firstName} {user.lastName}
					</li>
				))}
			</ul>
		</div>
	)
}
