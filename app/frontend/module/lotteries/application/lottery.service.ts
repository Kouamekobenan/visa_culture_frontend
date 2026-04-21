import { ILotteryRepository } from '../domain/interfaces/lottery.repository';

export class LotteryService {
  constructor(private readonly lotteryService: ILotteryRepository) {}
  async findAll(limit: number, page: number) {
    return await this.lotteryService.findAll(limit, page);
  }
  async toggleActivation(eventId: string) {
    return await this.lotteryService.toggleActivation(eventId);
  }
}
