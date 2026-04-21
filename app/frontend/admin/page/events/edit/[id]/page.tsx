import AdminSidebar from '@/app/frontend/admin/components/Navigation';

export default function EditEventPage() {
  return (
    <div className="flex h-screen bg-foreground overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Modifier l&apos;événement</h1>
          {/* Formulaire de modification de l'événement */}
        </div>
      </main>
    </div>
  );
}
