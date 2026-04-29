import { api } from '@/app/backend/database/api';
import {
  IprofileController,
  ControllerProfile,
} from '../domain/entities/controller.entity';
import { IControllerRepository } from '../domain/interfaces/controller.interface';

export class ControllerRepository implements IControllerRepository {
  async create(dto: IprofileController): Promise<ControllerProfile> {
    const res = await api.post('/controller-profiles', dto);
    return res.data;
  }
}
