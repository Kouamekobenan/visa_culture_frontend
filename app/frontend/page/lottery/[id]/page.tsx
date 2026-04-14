'use client';

import Header from '@/app/frontend/components/layout/Header';
import LotterySection from '@/app/frontend/components/pages/lottery/Prize';
import { useParams } from 'next/navigation';

export default function LotteryPage() {
  const params = useParams();

  // Sécurité sur l'ID (Next.js peut parfois retourner string[])
  const eventId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // Empêche le rendu si l'ID n'est pas encore chargé par le client
  if (!eventId) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

     
      <main className="container mx-auto px-4 py-8 md:py-16">
        <LotterySection eventId={eventId} />
      </main>
    </div>
  );
}
