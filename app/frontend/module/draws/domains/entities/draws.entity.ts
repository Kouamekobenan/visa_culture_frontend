import { Lottery } from '../../../lotteries/domain/entities/lottery.entity';

export class Draw {
  constructor(
    public readonly id: string,
    public lotteryId: string,
    // public drawWinners:any,
    public readonly executedAt: Date = new Date(),
    private lottery?: Lottery,
  ) {}
}
export interface DrawsDto {
  id: string;
  lotteryId: string;
  executedAt: Date;
  winners: WinnersDto;
  lottery: {
    id: string;
    eventId: string;
    isActive: boolean;
    createdAt: Date;
    event: EventDto;
  };
}
export interface WinnersDto {
  id: string;
  drawId: string;
  entryId: string;
  prizeId: string;
  _claimedAt: string | null;
  _isNotified: boolean;
}
export interface EventDto {
  id: string;
  title: string;
  date: Date;
  imageUrl: string;
}

export interface DrawWinnerDto {
  drawWinnerId: string;
  luckyNumber: number;
  drawnAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  prize: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  };
}

export interface WinnersUserDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  lotteryId: string;
  lottery: {
    id: string;
    event: {
      title: string;
      date: string;
      imageUrl: string;
    };
  };
  drawWinners: [
    {
      id: string;
      drawId: string;
      entry: {
        luckyNumber: number;
      };
    },
  ];
}
