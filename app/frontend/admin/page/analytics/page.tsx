'use client';

import AdminDashboardGraph from '@/app/frontend/admin/components/Graph';
import AdminSidebar from '@/app/frontend/admin/components/Navigation';
import AdminSearchBar from '@/app/frontend/admin/components/search/Search';
import { AdminResponse } from '@/app/frontend/admin/module/domain/entities/admin.repository';
import { AdminRepository } from '@/app/frontend/admin/module/infrastructure/admin.repository';
import { useCallback, useEffect, useState } from 'react';

const dashboardRepo = new AdminRepository();
type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AnalyticEvent() {
  const [data, setData] = useState<AdminResponse | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

 

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus('loading');
      try {
        const result = await dashboardRepo.getDashboardStats();
        if (!cancelled) {
          setData(result);
          setLastSync(new Date());
          setStatus('success');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
   return (
     <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted">
       <svg
         xmlns="http://www.w3.org/2000/svg"
         className="w-10 h-10 opacity-30"
         fill="none"
         viewBox="0 0 24 24"
         stroke="currentColor"
         strokeWidth={1.5}
       >
         <path
           strokeLinecap="round"
           strokeLinejoin="round"
           d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
         />
       </svg>
       <p className="text-sm font-medium opacity-50">
         Aucune donnée disponible
       </p>
     </div>
   );
  }

  return (
    <div className="flex h-screen bg-foreground overflow-hidden pb-24 md:pb-6">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-background px-2 pt-3">
          <AdminSearchBar />
        </div>
        <div>
          <AdminDashboardGraph data={data} />
        </div>
      </main>
    </div>
  );
}
