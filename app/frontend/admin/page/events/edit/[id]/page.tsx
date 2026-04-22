"use client";
import EventDashboard from '@/app/frontend/admin/components/DashbordEvent';
import AdminSidebar from '@/app/frontend/admin/components/Navigation';
import { useParams } from 'next/navigation';

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  return (
    <div className="flex h-screen bg-foreground overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <EventDashboard eventId={eventId} />
      </main>
    </div>
  );
}
