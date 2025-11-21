'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
    };
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Registration failed');
      return;
    }
    window.location.href = '/';
  };

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, width: 320 }}>
        <h1>Create account</h1>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password (min 6)" required />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Register</button>
        <a href="/login">Have an account? Login</a>
      </form>
    </main>
  );
}