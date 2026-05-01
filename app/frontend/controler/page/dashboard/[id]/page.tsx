'use client';
import Footer from '@/app/frontend/components/layout/Footer';
import Header from '@/app/frontend/components/layout/Header';
import ControllerDashboard from '../../../components/Dashbord';
import { useParams } from 'next/navigation';

export default function Dashboard() {
  const params = useParams();
  const controllerId = params?.id as string;
  if (!controllerId) {
    return;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <ControllerDashboard controllerId={controllerId} />
      <main className="flex flex-col text-title font-bold items-center justify-center flex-1 px-4 py-12 text-center"></main>
      <Footer />
    </div>
  );
}
