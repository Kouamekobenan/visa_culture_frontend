import { api } from '@/app/backend/database/api';
import { ControllerProfile, EventDay } from '../domain/entites/entity';
import {
  Gate,
  IControllerRepository,
  IGate,
  ResponseProfile,
} from '../domain/interface/controllerProfile.port';
import {
  ControllerDashboardDto,
  ControllerWithStats,
  CreateProfileDto,
} from '../domain/interface/dashbord-controlleur.dto';

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
  async create(dto: CreateProfileDto): Promise<ResponseProfile> {
    const result = await api.post(`/controller-profiles/admin`, dto);
    return result.data;
  }
  async findAllWithStats(): Promise<ControllerWithStats[]> {
    const result = await api.get(`/controller-profiles/stats/admin`);
    return result.data;
  }
  async findAllGates(): Promise<Gate[]> {
    const result = await api.get('/gates');
    return result.data;
  }
  async delete(id: string): Promise<void> {
    await api.delete(`/controller-profiles/${id}`);
  }
  async unassigneGate(id: string): Promise<ControllerProfile> {
    return await api.patch(`/controller-profiles/unsignGate/${id}`);
  }
}
