import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import LotteryPage from '../../components/pages/lottery/Lottery';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">
        <LotteryPage />
        <Footer />
      </main>
    </div>
  );
}
