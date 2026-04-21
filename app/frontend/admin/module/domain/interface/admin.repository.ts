import { AdminResponse } from '../entities/admin.repository';

export interface IAdminRepository {
  getDashboardStats(): Promise<AdminResponse>;
}
