import { api } from '@/app/backend/database/api';
import {
  IWhatsAppRepo,
  typeItems,
} from '../domain/interfaces/whatsApp.repository';
import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import { WhatsAppLogEntity } from '../domain/entities/whatsApp.entity';

export class WhatsAppRepository implements IWhatsAppRepo {
  async save(dto: typeItems): Promise<void> {
    await api.post(`/whatsapp/send-ticket`, dto);
  }
  async findByPhone(
    limit: number,
    page: number,
    phone: string,
  ): Promise<PaginatedResponseRepository<WhatsAppLogEntity>> {
    //  phone en query param, encodé pour éviter les problèmes avec le "+"
    const res = await api.get(
      `/whatsapp/logs/phone/${encodeURIComponent(phone)}?page=${page}&limit=${limit}`,
    );

    return {
      data: res.data.data,
      total: res.data.total,
      totalPages: res.data.totalPages,
      limit: res.data.limit,
      page: res.data.page,
    };
  }
  async finddAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<WhatsAppLogEntity>> {
    const res = await api.get(`/whatsapp/logs/?page=${page}&limit=${limit}`);
    return {
      data: res.data.data,
      total: res.data.total,
      totalPages: res.data.totalPages,
      limit: res.data.limit,
      page: res.data.page,
    };
  }
}
