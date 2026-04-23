import EspaceController from '../../components/EspaceController';
import AdminSidebar from '../../components/Navigation';

export default function Controller() {
  return (
    <div className="flex h-screen bg-foreground overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <EspaceController />
      </main>
    </div>
  );
}
