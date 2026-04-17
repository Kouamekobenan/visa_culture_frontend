export class UserStatisticsDto {
  constructor(
    public totalPayments: number,
    public totalTicketsPurchased: number,
    public totalLotteryParticipations: number,
    public totalPrizesWon: number,
    public totalAmountSpent: number,
    public paymentHistory: paymentHistory[],
  ) {}
}
export interface paymentHistory {
  id: string;
  amount: number;
  status: string;
  provider: string;
  createdAt: Date;
  ticketCount: number;
}
