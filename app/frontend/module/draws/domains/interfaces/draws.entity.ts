import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import {
  DrawsDto,
  DrawWinnerDto,
  WinnersUserDto,
} from '../entities/draws.entity';

export interface IDrawRepository {
  findAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<DrawsDto>>;
  findWinner(lotteryId: string): Promise<DrawWinnerDto>;
  findAllUserWinner(userId: string): Promise<WinnersUserDto[]>;
}
