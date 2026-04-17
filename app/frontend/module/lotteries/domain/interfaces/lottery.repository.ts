import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import { Lottery } from '../entities/lottery.entity';

export interface ILotteryRepository {
  findAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Lottery>>;
}
