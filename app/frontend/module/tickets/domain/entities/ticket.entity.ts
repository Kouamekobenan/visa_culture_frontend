import { TicketStatus } from '@/app/frontend/utils/types/manager.type';
import { Event } from '../../../event/domain/entities/event.entity';
import { TicketType } from '../../typesTicket/domain/entities/ticketType.entity';
import { User } from '../../../authentification/domain/entities/user.entity';

export class Ticket {
  constructor(
    public readonly id: string,
    public code: string,
    public userId: string,
    public eventId: string,
    public ticketTypeId: string,
    public status: TicketStatus,
    public scannedAt: string,
    public createdAt: string,
    public buyerName: string,
    public buyerPhone: string,
    public event?: Event,
    public ticketType?: TicketType,
    public payment?: IPayment,
    public user?: User,
    public scannedBy?: User,
  ) {}
}
export interface IPayment {
  id: string;
  amount: number;
  status: string;
  provider: string;
  createdAt: string;
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
