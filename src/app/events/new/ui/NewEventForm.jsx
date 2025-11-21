'use client';
import React, { useState } from 'react';

export default function NewEventForm({ categories = [], venues = [] }) {
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const categoryId = Number(formData.get('categoryId'));
    const venueId = Number(formData.get('venueId'));
    const startAt = new Date(String(formData.get('startAt')));
    const endAt = new Date(String(formData.get('endAt')));

    if (!title || !description) {
      setError('Title and description are required');
      return;
    }
    if (!categoryId || !venueId) {
      setError('Please select a category and a venue');
      return;
    }
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      setError('Please enter valid start and end times');
      return;
    }
    if (endAt <= startAt) {
      setError('End time must be after start time');
      return;
    }

    const res = await fetch('/api/events', { method: 'POST', body: formData });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Failed to create event');
      return;
    }
    window.location.href = '/events';
  };

  return (
    <form onSubmit={onSubmit} encType="multipart/form-data" style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
      <input name="title" placeholder="Title" required />
      <textarea name="description" placeholder="Description" required />
      <label>Starts at</label>
      <input type="datetime-local" name="startAt" required />
      <label>Ends at</label>
      <input type="datetime-local" name="endAt" required />
      <select name="categoryId" required>
        <option value="">Select category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select name="venueId" required>
        <option value="">Select venue</option>
        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
      <label>Poster (optional)</label>
      <input name="poster" type="file" accept="image/*" />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">Create</button>
    </form>
  );
}