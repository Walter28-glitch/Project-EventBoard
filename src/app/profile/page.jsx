'use client';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(async r => {
      if (r.ok) { const d = await r.json(); setMe(d.user); }
      else { window.location.href = '/login'; }
    });
  }, []);

  const onUpload = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Upload failed');
      return;
    }
    const d = await res.json();
    setMe(prev => ({ ...prev, profile: { ...(prev?.profile || {}), avatarUrl: d.avatarUrl } }));
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (!me) return <main style={{ padding: 24 }}>Loading...</main>;

  return (
    <main style={{ padding: 24, display: 'grid', gap: 12 }}>
      <h1>My Profile</h1>

      {me.profile?.avatarUrl
        ? <img src={me.profile.avatarUrl} alt="avatar" style={{ width: 96, height: 96, borderRadius: 48, objectFit: 'cover' }} />
        : <div style={{ width: 96, height: 96, borderRadius: 48, background: '#eee', display: 'grid', placeItems: 'center' }}>No avatar</div>
      }

      <div>Name: {me.name}</div>
      <div>Email: {me.email}</div>

      <form onSubmit={onUpload} encType="multipart/form-data" style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <input type="file" name="avatar" accept="image/*" required />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Upload avatar</button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <a href="/events"><button>Back to Events</button></a>
        <button onClick={logout}>Logout</button>
      </div>
    </main>
  );
}