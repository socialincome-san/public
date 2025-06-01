import { getUsers } from '@socialincome/shared/src/database/services/user-service';

export const dynamic = 'force-dynamic';

export default async function Portal() {
	const result = await getUsers();

	return (
		<main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
			<p>Here are your users from the database:</p>
			<ul>
				{!result.success && <li style={{ color: 'red' }}>⚠️ {result.error}</li>}

				{result.success && result.data.length === 0 && <li>No users found. Add some in the DB!</li>}

				{result.success &&
					result.data.map((user) => (
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
