import {
  CreateTicketTypeDTO,
  UpdateTicketTypeDTO,
} from '../domain/entities/ticketType.entity';
import { ITicketTypeRepository } from '../domain/interfaces/ticketType.entity';
export class TicketTypeService {
  constructor(private readonly ticketService: ITicketTypeRepository) {}
  async create(dto: CreateTicketTypeDTO) {
    return await this.ticketService.create(dto);
  }
  async findById(id: string) {
    return await this.ticketService.findById(id);
  }
  async findAllByEventId(id: string) {
    return await this.ticketService.findAllByEventId(id);
  }
  async update(id: string, dto: UpdateTicketTypeDTO) {
    return await this.ticketService.update(id, dto);
  }
  async delete(id: string) {
    await this.ticketService.delete(id);
  }
}
