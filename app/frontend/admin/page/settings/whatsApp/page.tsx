import LogsWhatsApp from '../../../components/LogsWhatsApp';
import AdminSidebar from '../../../components/Navigation';
import AdminSearchBar from '../../../components/search/Search';

export default function WhatsApp() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className=" px-2 pt-3">
          <AdminSearchBar />
        </div>
        <div className=""><LogsWhatsApp/></div>
      </main>
    </div>
  );
}
