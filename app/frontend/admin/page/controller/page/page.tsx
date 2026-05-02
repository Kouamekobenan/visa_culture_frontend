import AdminControllerDashboard from '../../../components/DashbordControllers';
import AdminSidebar from '../../../components/Navigation';
import AdminSearchBar from '../../../components/search/Search';

export default function Controller() {
  return (
    <div className="flex h-screen bg-foreground overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-background px-2 pt-3">
          <AdminSearchBar />
        </div>
        <AdminControllerDashboard />
      </main>
    </div>
  );
}
