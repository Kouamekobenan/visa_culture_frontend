'use client';
import HistoryEvent from '../../../components/history/HistoriqueEvent';
import AdminSidebar from '../../../components/Navigation';
import { useParams } from 'next/navigation';

export default function HistoryEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  return (
    <div className="flex h-screen bg-foreground overflow-hidden pb-24 md:pb-6">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <HistoryEvent eventId={eventId} />{' '}
      </main>
    </div>
  );
}
