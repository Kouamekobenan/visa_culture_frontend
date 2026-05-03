import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import EventPage from '../../components/pages/events/Event';
import LastEventPage from '../../components/pages/events/LastEvent';
import ProfessionalAdBanner from '../../components/pages/events/Pub';

export default function PageEvent() {
  return (
    <div
      className="flex flex-col min-h-screen bg-background font-sans "
      id="event"
    >
      <Header />
      <ProfessionalAdBanner />
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 mt-6 text-center">
        <EventPage />
        <LastEventPage />
      </main>
      <Footer />
    </div>
  );
}
