import { AdminEventDTO } from '../entities/admin-event.dto';
import { AdminResponse } from '../entities/admin.repository';

export interface IAdminRepository {
  getDashboardStats(): Promise<AdminResponse>;
  getAdminEventsStats(eventId: string): Promise<AdminEventDTO>;
}
