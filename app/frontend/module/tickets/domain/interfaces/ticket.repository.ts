import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import {
  CreateTicket,
  Ticket,
  TicketResponse,
  UpdateTicketDto,
} from '../entities/ticket.entity';
export interface ITicketRepository {
  create(dto: CreateTicket, quantity: number): Promise<TicketResponse>;
  findById(id: string): Promise<Ticket | null>;
  findAllByEventId(
    eventId: string,
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Ticket>>;
  delete(id: string): Promise<void>;
  update(id: string, data: UpdateTicketDto): Promise<Ticket>;
  ticketHistory(
    userId: string,
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Ticket>>;
}
