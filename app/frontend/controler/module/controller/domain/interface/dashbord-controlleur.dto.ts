import { TicketStatus } from '@/app/frontend/utils/types/manager.type';

export interface ControllerDashboardDto {
  controller: ControllerInfoDto;
  stats: ControllerStatsDto;
  recentScans: RecentScanDto[];
}

export interface ControllerInfoDto {
  fullName: string;
  photoUrl: string;
  gate: string;
}

export interface ControllerStatsDto {
  totalScannedToday: number;
  lastScanAt: string;
}

export interface RecentScanDto {
  code: string;
  status: TicketStatus;
  scannedAt: string;
  eventTitle: string;
  ticketType: string;
}
