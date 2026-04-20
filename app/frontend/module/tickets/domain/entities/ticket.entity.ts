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
    private buyerName: string,
    private buyerPhone: string,
  ) {}
}
export interface CreateTicket {
  userId: string;
  eventId: string;
  ticketTypeId: string;
  buyerName: string;
  buyerPhone: string;
}
export interface TicketResponse {
  paymentId: string;
  quantity: number;
}
export interface UpdateTicketDto {
  status?: TicketStatus;
  scannedAt?: string;
}
export interface HistoriqueTicketDto {
  id: string;
  code: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  createdAt: string;
  buyerName: string;
  buyerPhone: string;
  event: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    location: string;
    date: Date;
  };
  ticketType: { name: string; price: string };
  payment: { amount: number; status: string; provider: string };
}
export interface EventDto {
  id: string;
  // userId:string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  date: Date;
}
export interface PrintTicketsResultDto {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  ticketCount: number;
}
