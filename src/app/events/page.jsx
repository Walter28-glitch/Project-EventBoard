'use client';
import { useEffect, useState } from 'react';

const formatDate = (iso) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [me, setMe] = useState(null);

  const refresh = async () => {
    const res = await fetch('/api/events');
    const d = await res.json().catch(() => ({ events: [] }));
    setEvents(d.events || []);
  };

  useEffect(() => {
    fetch('/api/auth/me').then(async (r) => {
      if (r.ok) {
        const d = await r.json();
        setMe(d.user);
      }
    });
    refresh();
  }, []);

  const rsvp = async (id, status) => {
    const res = await fetch(`/api/events/${id}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert('Please login to RSVP');
      return;
    }
    await refresh();
  };

  const comment = async (e, id) => {
    e.preventDefault();
    const form = e.currentTarget;
    const content = new FormData(form).get('content');
    const res = await fetch(`/api/events/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      alert('Please login or enter a valid comment');
      return;
    }
    form.reset();
    await refresh();
  };

  const destroyEvent = async (id) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      let msg = 'Failed to delete';
      try {
        const d = await res.json();
        if (d?.error) msg = d.error;
      } catch {
        msg = `${res.status} ${res.statusText}`;
      }
      alert(msg);
      return;
    }
    await refresh();
  };

  const linkBtn = {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#f8f8f8',
    textDecoration: 'none',
    color: '#000',
    display: 'inline-block',
  };

  const rsvpBtn = {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
  };

  const rsvpActive = {
    GOING: { background: '#22c55e', borderColor: '#22c55e', color: '#fff' },
    INTERESTED: { background: '#3b82f6', borderColor: '#3b82f6', color: '#fff' },
    CANCELED: { background: '#9ca3af', borderColor: '#9ca3af', color: '#111' },
  };

  return (
    <main style={{ padding: 24, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <a href="/events/new" style={linkBtn}>Create Event</a>
        {!me ? (
          <a href="/login" style={linkBtn}>Login</a>
        ) : (
          <>
            <a href="/profile" style={linkBtn}>Profile</a>
            <button onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => location.reload())}>
              Logout
            </button>
            <span>Hi, {me.name}</span>
          </>
        )}
      </div>

      {events.map((ev) => {
        const myStatus = me ? (ev.rsvps || []).find((r) => r.userId === me.id)?.status : null;

        return (
          <div key={ev.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <h3>{ev.title}</h3>
            <div>{ev.description}</div>
            <div suppressHydrationWarning>
              When: {formatDate(ev.startAt)} → {formatDate(ev.endAt)}
            </div>
            <div>Where: {ev.venue?.name}</div>
            <div>Category: {ev.category?.name}</div>
            <div>
              Organizer:{' '}
              {ev.organizer ? <a href={`/users/${ev.organizer.id}`}>{ev.organizer.name}</a> : 'Unknown'}
            </div>
            {ev.posterUrl && (
              <img src={ev.posterUrl} alt="poster" style={{ maxWidth: 240, marginTop: 8 }} />
            )}

            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => rsvp(ev.id, 'GOING')}
                style={{ ...rsvpBtn, ...(myStatus === 'GOING' ? rsvpActive.GOING : {}) }}
                aria-pressed={myStatus === 'GOING'}
                disabled={myStatus === 'GOING'}
              >
                Going
              </button>
              <button
                onClick={() => rsvp(ev.id, 'INTERESTED')}
                style={{ ...rsvpBtn, ...(myStatus === 'INTERESTED' ? rsvpActive.INTERESTED : {}) }}
                aria-pressed={myStatus === 'INTERESTED'}
                disabled={myStatus === 'INTERESTED'}
              >
                Interested
              </button>
              <button
                onClick={() => rsvp(ev.id, 'CANCELED')}
                style={{ ...rsvpBtn, ...(myStatus === 'CANCELED' ? rsvpActive.CANCELED : {}) }}
                aria-pressed={myStatus === 'CANCELED'}
                disabled={myStatus === 'CANCELED'}
              >
                Cancel
              </button>

              {me?.id === ev.organizer?.id && (
                <button
                  onClick={() => destroyEvent(ev.id)}
                  style={{ marginLeft: 'auto', color: '#b00', borderColor: '#b00' }}
                  title="Delete this event"
                >
                  Delete
                </button>
              )}
            </div>

            {me && <div style={{ color: '#555' }}>Your RSVP: {myStatus || 'None'}</div>}

            <div style={{ marginTop: 12 }}>
              <strong>Comments</strong>
              <ul>
                {(ev.comments || []).map((c) => (
                  <li key={c.id}>
                    <em>
                      <a href={`/users/${c.user?.id}`}>{c?.user?.name || 'Anon'}</a>:
                    </em>{' '}
                    {c.content}
                  </li>
                ))}
              </ul>
              <form onSubmit={(e) => comment(e, ev.id)} style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <input name="content" placeholder="Write a comment..." required style={{ flex: 1 }} />
                <button type="submit">Post</button>
              </form>
            </div>
          </div>
        );
      })}
    </main>
  );
}