import AdminSidebar from '../../components/Navigation';
import AdminSearchBar from '../../components/search/Search';
import Users from '../../components/UserPaginate';

export default function UsersPage() {
  return (
    <div className="flex h-screen bg-foreground overflow-hidden  pb-24 md:pb-6">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-background px-2 pt-3">
          <AdminSearchBar />
        </div>
        <Users />
      </main>
    </div>
  );
}
