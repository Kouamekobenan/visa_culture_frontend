import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import { Lottery } from '../domain/entities/lottery.entity';
import { ILotteryRepository } from '../domain/interfaces/lottery.repository';
import { api } from '@/app/backend/database/api';
export class LotteryRepository implements ILotteryRepository {
  async findAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Lottery>> {
    const res = await api.get(`/lotteries/?page=${page}&limit=${limit}`);
    return {
      data: res.data.data,
      total: res.data.total,
      totalPages: res.data.totalPages,
      limit: res.data.limit,
      page: res.data.page,
    };
  }
  async toggleActivation(eventId: string): Promise<Lottery> {
    const res = await api.patch(`/lotteries/event/${eventId}/toggle`);
    return res.data;
  }
  async create(eventId: string): Promise<Lottery> {
    const res = await api.post(`/lotteries`, { eventId });
    return res.data;
  }
}
