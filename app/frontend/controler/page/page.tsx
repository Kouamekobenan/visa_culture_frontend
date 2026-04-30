'use client';
import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import { useAuth } from '../../context/useContext';
import TodayEventsController from '../components/Todayeventscontroller';

export default function ControlerPage() {
  const { user } = useAuth();
  const userId = user?.id;
  if (!user || !userId) {
    return;
  }
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <TodayEventsController controllerId={userId} />
      <main className="flex flex-col text-title font-bold items-center justify-center flex-1 px-4 py-12 text-center"></main>
      <Footer />
    </div>
  );
}
