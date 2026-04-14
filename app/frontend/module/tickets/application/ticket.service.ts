import {
  CreateTicket,
  UpdateTicketDto,
} from '../domain/entities/ticket.entity';
import { ITicketRepository } from '../domain/interfaces/ticket.repository';

export class TicketService {
  constructor(private readonly ticketService: ITicketRepository) {}
  async create(dto: CreateTicket, quantity: number) {
    return await this.ticketService.create(dto, quantity);
  }
  async findTicketById(id: string) {
    return await this.ticketService.findById(id);
  }
  async findAllByEventId(eventId: string, limit: number, page: number) {
    return await this.ticketService.findAllByEventId(eventId, limit, page);
  }
  async deleteTicket(id: string) {
    return await this.ticketService.delete(id);
  }
  async update(id: string, dto: UpdateTicketDto) {
    return await this.ticketService.update(id, dto);
  }
}
