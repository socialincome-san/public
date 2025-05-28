import { getUsers } from '@/server/repositories/user.repository';

export const dynamic = 'force-dynamic';

export default async function Portal() {
	const users = await getUsers();

	return (
		<main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
			<p>Here are your users from the database:</p>
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
