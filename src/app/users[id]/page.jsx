import prisma from '@/app/lib/prisma';
import { notFound } from 'next/navigation';

const formatDate = (iso) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'UTC'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export default async function UserProfilePage({ params }) {
  const id = Number(params.id);
  if (!id) notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,

      profile: { select: { avatarUrl: true, bio: true } },
      events: { orderBy: { startAt: 'desc' }, select: { id: true, title: true, startAt: true } },
      comments: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, createdAt: true, event: { select: { id: true, title: true } } }
      },
      rsvps: {
        orderBy: { createdAt: 'desc' },
        select: { status: true, createdAt: true, event: { select: { id: true, title: true, startAt: true } } }
      }
    }
  });

  if (!user) notFound();

  return (
    <main style={{ padding: 24, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {user.profile?.avatarUrl
          ? <img src={user.profile.avatarUrl} alt="avatar" style={{ width: 96, height: 96, borderRadius: 48, objectFit: 'cover' }} />
          : <div style={{ width: 96, height: 96, borderRadius: 48, background: '#eee', display: 'grid', placeItems: 'center' }}>No avatar</div>
        }
        <div>
          <h1 style={{ margin: 0 }}>{user.name}</h1>
          {user.profile?.bio && <div style={{ color: '#555' }}>{user.profile.bio}</div>}
        </div>
      </div>

      <section>
        <h2>Organized Events</h2>
        {user.events.length === 0 ? (
          <div>No events organized yet.</div>
        ) : (
          <ul>
            {user.events.map(ev => (
              <li key={ev.id}>
                <a href="/events" style={{ textDecoration: 'underline' }}>{ev.title}</a>
                <small style={{ color: '#666' }}> ({formatDate(ev.startAt)})</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Recent Comments</h2>
        {user.comments.length === 0 ? (
          <div>No comments yet.</div>
        ) : (
          <ul>
            {user.comments.slice(0, 10).map(c => (
              <li key={c.id}>
                {c.content} on <strong>{c.event.title}</strong>
                <small style={{ color: '#666' }}> ({formatDate(c.createdAt)})</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>RSVPs</h2>
        {user.rsvps.length === 0 ? (
          <div>No RSVPs yet.</div>
        ) : (
          <ul>
            {user.rsvps.map((r, i) => (
              <li key={i}>
                {r.status} to <strong>{r.event.title}</strong>
                <small style={{ color: '#666' }}> ({formatDate(r.event.startAt)})</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <a href="/users" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 6, background: '#f8f8f8', textDecoration: 'none', width: 'max-content' }}>
        Back to Users
      </a>
    </main>
  );
}