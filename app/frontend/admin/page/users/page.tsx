import AdminSidebar from '../../components/Navigation';
import Users from '../../components/UserPaginate';

export default function UsersPage() {
  return (
    <div className="flex h-screen bg-foreground overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Users />
      </main>
    </div>
  );
}
