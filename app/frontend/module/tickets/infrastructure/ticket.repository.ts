import { api } from '@/app/backend/database/api';
import {
  CreateTicket,
  HistoriqueTicketDto,
  PrintTicketsResultDto,
  Ticket,
  TicketResponse,
  UpdateTicketDto,
} from '../domain/entities/ticket.entity';
import { ITicketRepository } from '../domain/interfaces/ticket.repository';
import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';

export class TicketRepository implements ITicketRepository {
  private readonly baseUrl = '/tickets';

  async create(dto: CreateTicket, quantity: number): Promise<TicketResponse> {
    // On crée un nouvel objet qui combine le DTO et la quantité
    const res = await api.post<TicketResponse>(this.baseUrl, {
      ...dto,
      quantity: quantity,
    });
    return res.data;
  }
  async findById(id: string): Promise<Ticket | null> {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  }

  async findAllByEventId(
    eventId: string,
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Ticket>> {
    const res = await api.get(
      `/tickets/event/${eventId}/?page=${page}&limit=${limit}`,
    );
    return {
      data: res.data.data,
      total: res.data.total,
      totalPages: res.data.totalPages,
      limit: res.data.limit,
      page: res.data.page,
    };
  }
  async update(id: string, data: UpdateTicketDto): Promise<Ticket> {
    const res = await api.patch(`/tickets/${id}`, data);
    return res.data;
  }
  async delete(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  }
  async ticketHistory(
    userId: string,
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Ticket>> {
    // ✅ Correction de l'inversion limit/page
    const res = await api.get(
      `/tickets/history/${userId}/?limit=${limit}&page=${page}`,
    );
    return {
      data: res.data.data,
      total: res.data.total,
      totalPages: res.data.totalPages,
      limit: res.data.limit,
      page: res.data.page,
    };
  }
  async printTickets(userId: string, eventId: string): Promise<void> {
    // 1. On spécifie le responseType 'blob' pour recevoir le PDF correctement
    const res = await api.post(
      `/tickets/print/${userId}/pdf`,
      { eventId },
      { responseType: 'blob' },
    );

    // 2. Création d'un lien temporaire pour déclencher le téléchargement
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Optionnel : Récupérer le nom du fichier depuis les headers si tu veux être précis
    link.setAttribute('download', `tickets-${eventId}.pdf`);
    document.body.appendChild(link);
    link.click();
    // Nettoyage
    link.remove();
    window.URL.revokeObjectURL(url);
  }
async scanTicket(code: string): Promise<HistoriqueTicketDto | null> {
  const res = await api.post('/tickets/scan', { code }); // Axios sérialise automatiquement
  return res.data;
}
}
