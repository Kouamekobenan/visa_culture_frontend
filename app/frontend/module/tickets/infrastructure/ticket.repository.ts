import { api } from '@/app/backend/database/api';
import {
  CreateTicket,
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
}
