import {
  ControllerProfile,
  IprofileController,
} from '../entities/controller.entity';

export interface IControllerRepository {
  create(dto: IprofileController): Promise<ControllerProfile>;
}
