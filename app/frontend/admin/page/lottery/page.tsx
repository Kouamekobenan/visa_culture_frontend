import LotteryPageAdmin from '../../components/lottery/LotteryActive';
import AdminSidebar from '../../components/Navigation';

export default function Page() {
  return (
    <div className="flex h-screen bg-foreground overflow-hidden pb-24 md:pb-6">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {' '}
        <LotteryPageAdmin />
      </main>
    </div>
  );
}
