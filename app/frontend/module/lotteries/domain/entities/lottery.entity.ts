export class Lottery {
  constructor(
    public id: string,
    public eventId: string,
    public isActivate: boolean,
    public createdAt: Date,
    public prizes: PrizeDto[],
    public event: EventDto,
  ) {}
}
export interface PrizeDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  lotteryId: string;
  winnerId: string;
  createdAt: Date;
}
export interface EventDto {
  title: string;
  imageUrl: string;
  date: Date;
}
