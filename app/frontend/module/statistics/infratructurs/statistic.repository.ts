import { api } from '@/app/backend/database/api';
import { UserStatisticsDto } from '../domain/entities/statistic.entity';
import { ISatisticsUser } from '../domain/interface/statistics.rpository';

export class StatisticUserRepository implements ISatisticsUser {
  async getUserStatistics(userId: string): Promise<UserStatisticsDto> {
    const result = await api.get(`/users/${userId}/statistics`);
    return result.data;
  }
}
