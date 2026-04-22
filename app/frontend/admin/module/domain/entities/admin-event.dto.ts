export interface AdminEventDTO {
  event: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    location: string;
    date: string;
    isActive: boolean;
    organizerName: string;
  };
  ticketStats: ITicketStatistics;
  revenue: IRevenueStatistics;
  lottery: ILotteryStatistics;
  trends: ITrends;
}
export interface ITicketStatistics {
  totalSold: number;
  totalAvailable: number;
  salesRate: number;
  byType: {
    typeName: string;
    price: number;
    sold: number;
    available: number;
    revenue: number;
  }[];
  byStatus: {
    valid: number;
    used: number;
    cancelled: number;
  };
}
export interface IRevenueStatistics {
  total: number;
  confirmed: number;
  pending: number;
  failed: number;
  byProvider: {
    provider: string;
    amount: number;
    count: number;
  }[];
}
export interface ILotteryStatistics {
  lotteryId:string;
  isActive: boolean;
  totalPrizes: number;
  totalEntries: number;
  totalDraws: number;
  winners: {
    userName: string;
    prizeTitle: string;
    luckyNumber: number;
    wonAt: string;
  }[];
}
export interface ITrends {
  salesByDay: {
    date: Date;
    count: number;
    revenue: number;
  }[];
  recentPurchases: {
    buyerName: string;
    ticketType: string;
    purchasedAt: string;
    amount: number;
  }[];
}
