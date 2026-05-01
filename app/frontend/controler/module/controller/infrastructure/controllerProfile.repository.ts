import { api } from '@/app/backend/database/api';
import { ControllerProfile, EventDay } from '../domain/entites/entity';
import {
  IControllerRepository,
  IGate,
} from '../domain/interface/controllerProfile.port';
import { ControllerDashboardDto } from '../domain/interface/dashbord-controlleur.dto';

export class ControllerRepository implements IControllerRepository {
  async getEventDay(): Promise<EventDay[]> {
    const result = await api.get('/events/controler/stats');
    return result.data;
  }
  async assigneGate(
    controllerId: string,
    dto: IGate,
  ): Promise<ControllerProfile> {
    const res = await api.patch(
      `/controller-profiles/assign-gate/${controllerId}`,
      dto,
    );
    return res.data;
  }
  async getDashboard(controllerId: string): Promise<ControllerDashboardDto> {
    const result = await api.get(
      `/controller-profiles/dashboard/${controllerId}`,
    );
    return result.data;
  }
}
