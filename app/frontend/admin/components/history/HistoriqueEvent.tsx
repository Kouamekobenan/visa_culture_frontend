'use client';

import { useEffect, useState } from 'react';
import {
  Printer,
  User,
  CreditCard,
  Calendar,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Ticket } from '@/app/frontend/module/tickets/domain/entities/ticket.entity';
import { TicketRepository } from '@/app/frontend/module/tickets/infrastructure/ticket.repository';
import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import { handlePrintTicket } from '../printTicket/PrintfTicket';
import Link from 'next/link';
import { Button } from '@/app/frontend/components/ui/Button';
const ticketRepository = new TicketRepository();
const LIMIT = 10;

export default function HistoryEvent({ eventId }: { eventId: string }) {
  const [ticketData, setTicketData] =
    useState<PaginatedResponseRepository<Ticket> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await ticketRepository.findAllByEventId(
          eventId,
          LIMIT,
          page,
        );
        console.log('data history:', res);
        setTicketData(res);
      } catch (error) {
        console.error('Erreur de récupération:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, page]);

  return (
    <div className="bg-white  shadow-xl border border-slate-200 overflow-hidden">
      {/* Barre d'outils supérieure */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <div>
          <h1 className="text-2xl font-bold text-title  tracking-tight">
            Historique des Flux
          </h1>
          <p className="text-sm text-slate-500">
            Suivi détaillé des émissions de tickets
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Rechercher un code..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-64"
            />
          </div>
          <div className="">
            <Link href={`/frontend/admin/page/events/edit/${eventId}`}>
              <Button variant="outline" size="sm">
                Retour
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Tableau des tickets */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Référence & Client</th>
              <th className="px-6 py-4 font-semibold">Controleur</th>
              <th className="px-6 py-4 font-semibold">Type de Billet</th>
              <th className="px-6 py-4 font-semibold">Transaction</th>
              <th className="px-6 py-4 font-semibold">Statut Flux</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading &&
              ticketData?.data.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-brand/50 text-sm">
                        {ticket.code}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                        <User size={12} />
                        <span className="text-xs">
                          {ticket.user?.name || 'Acheteur anonyme'}
                        </span>
                      </div>
                    </div>
                  </td>
                  {/* controleur */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono flex items-center font-bold text-indigo-600 text-sm">
                        <User size={12} />
                        {ticket.scannedBy?.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                        <span className="text-xs">
                          {ticket.scannedBy?.phone || 'Vendeur anonyme'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      <span className="text-xs font-bold uppercase">
                        {ticket.ticketType?.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                      Prix: {ticket.ticketType?.price} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-full ${ticket.payment?.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}
                      >
                        <CreditCard size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700">
                          {ticket.payment?.provider}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase leading-none">
                          {ticket.payment?.status}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold w-fit ${ticket.status === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}
                      >
                        {ticket.status}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={10} />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handlePrintTicket(ticket)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      <Printer size={14} />
                      Imprimer
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Professionnelle */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          Affichage de {ticketData?.data.length} sur {ticketData?.total} tickets
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 border rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180 text-slate-600" />
          </button>
          <button
            disabled={page >= (ticketData?.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 border rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ArrowRight size={16} className="text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
