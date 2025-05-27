import { prisma } from '@/server/prisma';

export const dynamic = 'force-dynamic';

export default async function Portal() {
	const users = await prisma.user.findMany({
		take: 5,
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			role: true,
		},
	});

	return (
		<main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
			<p>Here are the 5 newest users from your database:</p>

			<ul>
				{users.length === 0 && <li>No users found. Add some in the DB!</li>}
				{users.map((user) => (
					<li key={user.id}>
						👤{' '}
						<strong>
							{user.firstName} {user.lastName}
						</strong>{' '}
						– <em>{user.role}</em>
					</li>
				))}
			</ul>
		</main>
	);
}
