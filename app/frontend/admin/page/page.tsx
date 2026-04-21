// app/admin/layout.tsx

import AdminSidebar from '../components/Navigation';
import AdminDashboard from './dashbord/page';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-foreground overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminDashboard></AdminDashboard>
      </main>
    </div>
  );
}
