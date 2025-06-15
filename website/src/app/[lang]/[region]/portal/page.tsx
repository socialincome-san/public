import { UserService } from '@socialincome/shared/src/database/user/user.service';

export default async function Portal() {
	const userService = new UserService();
	const result = await userService.getUsers();

	return (
		<main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
			<p>Here are your users from the database:</p>
			<ul>
				{!result.success && <li style={{ color: 'red' }}>⚠️ {result.error}</li>}

				{result.success && result.data.length === 0 && <li>No users found. Add some in the DB!</li>}

				{result.success &&
					result.data.map((user) => (
						<li key={user.id}>
							💃🏼{' '}
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
