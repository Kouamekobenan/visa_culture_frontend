import { TicketStatus } from '@/app/frontend/utils/types/manager.type';

export class Ticket {
  constructor(
    public readonly id: string,
    public code: string,
    public userId: string,
    public eventId: string,
    public ticketTypeId: string,
    public status: TicketStatus,
    public scannedAt: string,
    public createdAt: Date,
  ) {}
}
export interface CreateTicket {
  userId: string;
  eventId: string;
  ticketTypeId: string;
}
export interface TicketResponse {
  paymentId: string;
  quantity: number;
}
export interface UpdateTicketDto {
  status?: TicketStatus;
  scannedAt?: string;
}
