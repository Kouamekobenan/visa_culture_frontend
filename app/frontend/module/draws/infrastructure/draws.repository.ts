import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import {
  DrawsDto,
  DrawWinnerDto,
  WinnersUserDto,
} from '../domains/entities/draws.entity';
import { IDrawRepository } from '../domains/interfaces/draws.entity';
import { api } from '@/app/backend/database/api';
export class DrawRepository implements IDrawRepository {
  async findAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<DrawsDto>> {
    const res = await api.get(`/draws/?page=${page}&limit=${limit}`);
    return {
      data: res.data.data,
      total: res.data.total,
      totalPages: res.data.totalPages,
      limit: res.data.limit,
      page: res.data.page,
    };
  }
  async findWinner(lotteryId: string): Promise<DrawWinnerDto> {
    const result = await api.get(`/lotteries/${lotteryId}/winners`);
    return result.data;
  }
  async findAllUserWinner(userId: string): Promise<WinnersUserDto[]> {
    const res = await api.get(`/prizes/${userId}/user`);
    return res.data;
  }
}
