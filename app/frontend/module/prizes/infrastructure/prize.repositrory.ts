import { api } from '@/app/backend/database/api';
import { Prize } from '../domain/entities/prize.entity';
import { IPrizeRepository } from '../domain/interfaces/prize.repository';

export class PrizeRepository implements IPrizeRepository {
  async findPrizeRecent(): Promise<Prize[]> {
    const prizes = await api.get('/prizes/prize/recent');
    return prizes.data;
  }
}
