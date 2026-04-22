export interface AdminResponse {
  users: {
    total: number;
    byRole: {
      role: string;
      count: number;
    }[];
    newLast7Days: number;
    newLast30Days: number;
    withPhone: number;
  };
  events: {
    total: number;
    active: number;
    past: number;
    upcoming: number;
    topEvents: {
      id: string;
      title: string;
      date: Date;
      ticketCount: number;
    }[];
  };
  tickets: {
    total: number;
    byStatus: {
      status: string;
      count: number;
    }[];
    scanRate: number;
  };
  payments: {
    totalRevenue: number;
    revenueLast7Days: number;
    revenueLastMonth: number;
    byStatus: {
      status: string;
      count: number;
      amount: number;
    }[];
    byProvider: {
      provider: string;
      count: number;
      amount: number;
    }[];
  };
  lottery: {
    total: number;
    active: number;
    totalEntries: number;
    totalDraws: number;
    prizesAwarded: number;
  };
  notifications: {
    total: number;
    unread: number;
    readRate: number;
    byType: {
      type: string;
      count: number;
    }[];
  };
  generatedAt: Date;
}