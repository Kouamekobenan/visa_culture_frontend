import Footer from '@/app/frontend/components/layout/Footer';
import Header from '@/app/frontend/components/layout/Header';
import NotificationUser from '@/app/frontend/components/pages/profile/Notification';

export default function Notification() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <main className="flex flex-col text-title font-bold items-center justify-center flex-1  text-center">
        <NotificationUser />
      </main>
      <Footer />
    </div>
  );
}
