'use client';

import { useAuth } from '@/app/frontend/context/useContext';
import { WhatsAppLogEntity } from '@/app/frontend/module/whatsApp/domain/entities/whatsApp.entity';
import { WhatsAppRepository } from '@/app/frontend/module/whatsApp/infrastructure/whatsAppRepository';
import { formatFullDate } from '@/app/frontend/utils/types/conversion.data';
import {
  NAME,
  PaginatedResponseRepository,
} from '@/app/frontend/utils/types/manager.type';
import { useEffect, useState, useCallback } from 'react';
import { MessageCircle, ChevronLeft, ChevronRight, Bell } from 'lucide-react';

const whatReposervice = new WhatsAppRepository();

export default function NotificationUser() {
  const [notifications, setNotifications] =
    useState<PaginatedResponseRepository<WhatsAppLogEntity>>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  const limitPage = 10; 
  const { user } = useAuth();
  const phone = user?.phone as string;
  const fetchData = useCallback(async () => {
    if (!phone) return;
    setIsLoading(true);
    try {
      const res = await whatReposervice.findByPhone(
        limitPage,
        currentPage,
        phone,
      );
      setNotifications(res);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, phone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    if (
      notifications &&
      newPage >= 1 &&
      newPage <= (notifications.totalPages || 1)
    ) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface pb-4">
        <h1 className="text-3xl font-bold text-title flex items-center gap-3">
          <Bell className="text-brand" />
          Mes notifications
        </h1>
        <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium">
          {notifications?.total || 0} messages
        </span>
      </div>
      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin-slow rounded-full h-12 w-12 border-t-2 border-brand"></div>
          </div>
        ) : notifications?.data && notifications.data.length > 0 ? (
          <div className="grid gap-4">
            {notifications.data.map((n) => (
              <div
                key={n.id}
                className="bg-surface p-5 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow flex items-start gap-4"
              >
                <div className="p-3 bg-brand/10 rounded-lg text-brand">
                  <MessageCircle size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      {n.type} •{' '}
                      <span
                        className={
                          n.status === 'SENT' ? 'text-btn' : 'text-error'
                        }
                      >
                        {n.status}
                      </span>
                    </span>
                    <span className="text-xs text-muted">
                      {formatFullDate(n.sentAt)}
                    </span>
                  </div>

                  <div className="text-foreground leading-relaxed">
                    {n.type === 'TICKET' ? (
                      <p>
                        Vous avez reçu un message via <strong>WhatsApp</strong>{' '}
                        concernant votre ticket du
                        <span className="text-brand mx-1">
                          {formatFullDate(n.sentAt)}
                        </span>
                        pour l&apos;événement{' '}
                        <span className="font-bold text-title">
                          {n.eventName}
                        </span>
                        .
                      </p>
                    ) : (
                      <p>
                        Vous avez reçu un message de la part de{' '}
                        <strong>{NAME}</strong>.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface rounded-2xl">
            <h2 className="text-xl font-semibold text-muted">
              Aucune notification pour le moment.
            </h2>
            <p className="text-muted/60 mt-2">
              Vos messages WhatsApp apparaîtront ici.
            </p>
          </div>
        )}
      </div>
      {/* Pagination UI */}
      {notifications && notifications.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-surface">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-surface hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft />
          </button>

          <div className="flex gap-2">
            {Array.from(
              { length: notifications.totalPages },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  currentPage === page
                    ? 'bg-brand text-white shadow-lg scale-110'
                    : 'bg-surface text-muted hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === notifications.totalPages}
            className="p-2 rounded-lg bg-surface hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
