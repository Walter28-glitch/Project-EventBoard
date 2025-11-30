import Link from 'next/link';

export default function Home() {
const btn = {
padding: '8px 14px',
border: '1px solid #ccc',
borderRadius: 6,
textDecoration: 'none',
background: '#f8f8f8',
color: '#000',
display: 'inline-block',
};
return (
<main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
<div style={{ display: 'grid', gap: 10, textAlign: 'center' }}>
<h1>EventBoard</h1>
<Link href="/events" style={btn}>View Events</Link>
<Link href="/events/new" style={btn}>Create Event</Link>
<Link href="/register" style={btn}>Register</Link>
<Link href="/login" style={btn}>Login</Link>
<Link href="/profile" style={btn}>My Profile</Link>
<Link href="/users" style={btn}>Browse Users</Link>
</div>
</main>
);
}
