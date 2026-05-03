'use client';
import EventAnalytics from '@/app/frontend/admin/components/EventAlytics';
import AdminSidebar from '@/app/frontend/admin/components/Navigation';
import { useParams } from 'next/navigation';
export default function AnalyticEvent() {
  const params = useParams();
  const eventId = params?.id as string;
  return (
    <div className="flex h-screen bg-foreground overflow-hidden pb-24 md:pb-6">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <EventAnalytics eventId={eventId} />
      </main>
    </div>
  );
}
