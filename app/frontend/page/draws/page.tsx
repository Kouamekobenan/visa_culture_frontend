import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import DrawsComponent from '../../components/pages/draws/Draw';

export default function DrawPage() {
  return (
    <div
      className="flex flex-col min-h-screen bg-background font-sans"
      id="event"
    >
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">
        <DrawsComponent />
      </main>
      <Footer />
    </div>
  );
}
