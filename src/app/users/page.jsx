import prisma from '@/app/lib/prisma';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, profile: { select: { avatarUrl: true } } }
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Users</h1>
      {users.length === 0 ? (
        <div>No users yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
          {users.map(u => (
            <li key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {u.profile?.avatarUrl
                ? <img src={u.profile.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover' }} />
                : <span style={{ width: 32, height: 32, borderRadius: 16, background: '#eee', display: 'inline-block' }} />
              }
              <a href={`/users/${u.id}`}>{u.name}</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}