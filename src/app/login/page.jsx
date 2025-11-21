'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Login failed');
      return;
    }
    window.location.href = '/';
  };

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, width: 320 }}>
        <h1>Login</h1>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Login</button>
        <a href="/register">Create account</a>
      </form>
    </main>
  );
}