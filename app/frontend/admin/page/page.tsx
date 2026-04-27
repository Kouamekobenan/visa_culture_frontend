// app/admin/layout.tsx

import AdminSidebar from '../components/Navigation';
import AdminSearchBar from '../components/search/Search';
import AdminDashboard from './dashbord/page';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className=" px-2 pt-3">
          <AdminSearchBar />
        </div>
        <div className="">
          <AdminDashboard></AdminDashboard>
        </div>
      </main>
    </div>
  );
}
