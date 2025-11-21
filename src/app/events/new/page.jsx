import prisma from '@/app/lib/prisma';
import NewEventForm from './ui/NewEventForm';

export default async function NewEventPage() {
  const [categories, venues] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.venue.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Create Event</h1>
      <NewEventForm categories={categories} venues={venues} />
    </main>
  );
}