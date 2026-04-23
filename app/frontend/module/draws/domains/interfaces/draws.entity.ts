import { PaginatedResponseRepository } from '@/app/frontend/utils/types/manager.type';
import {
  DrawsDto,
  DrawWinnerDto,
  WinnersUserDto,
} from '../entities/draws.entity';
// ✅ Corrigé
export interface lotteryDto {
  lotteryId: string;
}

export interface IDrawRepository {
  findAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<DrawsDto>>;
  findWinner(lotteryId: string): Promise<DrawWinnerDto>;
  findAllUserWinner(userId: string): Promise<WinnersUserDto[]>;
  save(lottery: lotteryDto): Promise<void>;
}
