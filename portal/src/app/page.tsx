import { prisma } from '@/server/prisma';
import { User } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🎉🎉🎉 Hello from Cloud Run + Prisma</h1>
      <p>Here are the 5 newest users from your database:</p>

      <ul>
        {users.length === 0 && <li>No users found. Add some in the DB!</li>}
        {users.map((user: User) => (
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
