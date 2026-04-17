import { StatisticUserRepository } from '../infratructurs/statistic.repository';

export class StatisticService {
  constructor(private readonly statsRepository: StatisticUserRepository) {}
  async findAllStatUser(userId: string) {
    return await this.statsRepository.getUserStatistics(userId);
  }
}
