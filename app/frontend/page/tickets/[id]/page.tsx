'use client';

import Header from '@/app/frontend/components/layout/Header';
import TicketSelection from '@/app/frontend/components/pages/tickets/Ticket';
import { Event } from '@/app/frontend/module/event/domain/entities/event.entity';
import { EventRepository } from '@/app/frontend/module/event/infrastructure/event.repository';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
const eventRepo = new EventRepository();

export default function TicketPage() {
  const [event, setEvent] = useState<Event | null>(null);
  // const params = useParams();
  const params = useParams();
  const eventId = params?.id as string;
  useEffect(() => {
    const fetchEventData = async () => {
      const response = await eventRepo.getEventById(eventId);
      setEvent(response);
    };
    fetchEventData();
  }, [eventId]);
  if (!eventId || !event?.title) return null;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Utilisation de balises sémantiques pour le SEO et l'accessibilité */}
      <main className="container mx-auto py-6 md:py-12">
        <TicketSelection eventId={eventId} eventName={event?.title} />
      </main>
    </div>
  );
}
