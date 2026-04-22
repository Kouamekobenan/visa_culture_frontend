import { api } from '@/app/backend/database/api';
import { AdminResponse } from '../domain/entities/admin.repository';
import { IAdminRepository } from '../domain/interface/admin.repository';
import { AdminEventDTO } from '../domain/entities/admin-event.dto';

export class AdminRepository implements IAdminRepository {
  async getDashboardStats(): Promise<AdminResponse> {
    // Simulate an API call with mock data
    const res = await api.get('admin/dashboard');
    return res.data as AdminResponse;
  }

  async getAdminEventsStats(eventId: string): Promise<AdminEventDTO> {
    // Simulate an API call with mock data
    const res = await api.get(`admin/${eventId}/dashboard`);
    return res.data ;
  }
}
