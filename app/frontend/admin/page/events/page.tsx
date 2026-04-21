// app/admin/layout.ts

import AdminEventsPage from "../../components/Event";
import AdminSidebar from "../../components/Navigation";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-foreground overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto"><AdminEventsPage></AdminEventsPage></main>
    </div>
  );
}
