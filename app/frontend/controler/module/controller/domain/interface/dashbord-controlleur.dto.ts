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

export interface CreateProfileDto {
  fullName: string;
  email: string;
  phone: string;
  educationLevel?: string;
  photoUrl?: string;
  password: string;
}

export interface ControllerWithStats {
  id: string;
  fullName: string;
  photoUrl: string | null;
  educationLevel: string | null;
  userId: string;
  gateId: string | null;
  gate: {
    id: string;
    name: string;
    event: { id: string; title: string };
  } | null;
  user: { email: string; phone: string | null };
  totalScansToday: number;
  totalScansAllTime: number;
  lastScanAt: string | null;
  isActive: boolean; // true si scannedAt dans les 30 dernières minutes
}
