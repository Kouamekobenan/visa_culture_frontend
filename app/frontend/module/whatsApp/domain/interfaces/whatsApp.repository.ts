import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import { WhatsAppLogEntity } from '../entities/whatsApp.entity';

export interface typeItems {
  phone: string;
  eventName: string;
  ticketUrl: string;
}
export interface IWhatsAppRepo {
  save(dto: typeItems): Promise<void>;
  findByPhone(
    limit: number,
    page: number,
    phone: string,
  ): Promise<PaginatedResponseRepository<WhatsAppLogEntity>>;
  finddAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<WhatsAppLogEntity>>;
}
