import { api } from '@/app/backend/database/api';
import {
  CreateTicketTypeDTO,
  TicketType,
  UpdateTicketTypeDTO,
} from '../domain/entities/ticketType.entity';
import { ITicketTypeRepository } from '../domain/interfaces/ticketType.entity';

export class TicketTypeRepository implements ITicketTypeRepository {
  async create(data: CreateTicketTypeDTO): Promise<TicketType> {
    const res = await api.post('/ticket-types', data);
    return res.data;
  }
  async findById(id: string): Promise<TicketType | null> {
    const res = await api.get(`ticket-types/event/${id}`);
    return res.data;
  }
  async findAllByEventId(eventId: string): Promise<TicketType[]> {
    const res = await api.get(`/ticket-types/${eventId}`);
    return res.data;
  }
  async delete(id: string): Promise<void> {
    await api.delete(`/ticket-types/${id}`);
  }
  async update(id: string, data: UpdateTicketTypeDTO): Promise<TicketType> {
    const res = await api.put(`/ticket-types/${id}`, data);
    return res.data;
  }
}
