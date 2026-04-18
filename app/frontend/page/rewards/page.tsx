import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import Reward from '../../components/pages/rewards/Reward';

export default function Page() {
  return (
    <div
      className="flex flex-col min-h-screen bg-background font-sans"
      id="event"
    >
      <Header />
      <Reward />
      {/* <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center"></main> */}
      <Footer />
    </div>
  );
}
