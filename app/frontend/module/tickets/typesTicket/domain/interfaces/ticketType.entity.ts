import { CreateTicketTypeDTO, TicketType, UpdateTicketTypeDTO } from "../entities/ticketType.entity";

export interface ITicketTypeRepository {
  create(data: CreateTicketTypeDTO): Promise<TicketType>;
  findById(id: string): Promise<TicketType | null>;
  findAllByEventId(eventId: string): Promise<TicketType[]>;
  update(id: string, data: UpdateTicketTypeDTO): Promise<TicketType>;
  delete(id: string): Promise<void>;
}
