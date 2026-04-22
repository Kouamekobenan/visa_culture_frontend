import { api } from '@/app/backend/database/api';
import { CreatePrizeDTO, Prize } from '../domain/entities/prize.entity';
import { IPrizeRepository } from '../domain/interfaces/prize.repository';

export class PrizeRepository implements IPrizeRepository {
  async findPrizeRecent(): Promise<Prize[]> {
    const prizes = await api.get('/prizes/prize/recent');
    return prizes.data;
  }
  async create(dto: CreatePrizeDTO, file?: File | null): Promise<Prize> {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('lotteryId', dto.lotteryId);
    if (file) {
      formData.append('imageUrl', file);
    }
    const res = await api.post('/prizes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
}
