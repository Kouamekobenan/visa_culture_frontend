'use client';

import Header from '@/app/frontend/components/layout/Header';
import TicketSelection from '@/app/frontend/components/pages/tickets/Ticket';
import { useParams } from 'next/navigation';

export default function TicketPage() {
  // const params = useParams();
  const params = useParams();
  const eventId = params?.id as string;

  if (!eventId) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Utilisation de balises sémantiques pour le SEO et l'accessibilité */}
      <main className="container mx-auto py-6 md:py-12">
        <TicketSelection eventId={eventId} />
      </main>

      {/* Optionnel : Un pied de page ou un bouton de retour */}
    </div>
  );
}
