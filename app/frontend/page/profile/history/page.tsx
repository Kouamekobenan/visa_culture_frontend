import Footer from '@/app/frontend/components/layout/Footer';
import Header from '@/app/frontend/components/layout/Header';
import { TicketHistoryPage } from '@/app/frontend/components/pages/profile/Historique';

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <main className="flex flex-col text-title font-bold items-center justify-center flex-1 px-4 py-12 text-center">
        <TicketHistoryPage />
      </main>
      <Footer />
    </div>
  );
}
