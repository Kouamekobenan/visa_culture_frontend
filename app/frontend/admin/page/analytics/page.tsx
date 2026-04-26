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

  const fetchData = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await dashboardRepo.getDashboardStats();
      setData(result);
      setLastSync(new Date());
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, []);

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
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div className="flex h-screen bg-foreground overflow-hidden">
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
