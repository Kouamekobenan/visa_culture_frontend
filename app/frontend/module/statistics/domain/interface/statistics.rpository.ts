import { UserStatisticsDto } from '../entities/statistic.entity';

export interface ISatisticsUser {
  getUserStatistics(userId: string): Promise<UserStatisticsDto>;
}
