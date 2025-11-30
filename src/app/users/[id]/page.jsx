export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import prisma from '@/app/lib/prisma';

const fmt = (iso) => {
try {
return new Intl.DateTimeFormat('en-US', {
year: 'numeric', month: 'short', day: '2-digit',
hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
}).format(new Date(iso));
} catch { return iso; }
};

export default async function UserProfilePage({ params }) {
const id = Number(params.id);
if (!Number.isInteger(id) || id <= 0) return <main style={{ padding: 24 }}>Invalid user id.</main>;

const user = await prisma.user.findUnique({
where: { id },
select: {
id: true, name: true,
profile: { select: { avatarUrl: true, bio: true } },
events: { orderBy: { startAt: 'desc' }, select: { id: true, title: true, startAt: true } },
comments: { orderBy: { createdAt: 'desc' }, select: { id: true, content: true, createdAt: true, event: { select: { id: true, title: true } } } },
rsvps: { orderBy: { createdAt: 'desc' }, select: { status: true, createdAt: true, event: { select: { id: true, title: true, startAt: true } } } },
},
});
if (!user) return <main style={{ padding: 24 }}>User not found.</main>;

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
