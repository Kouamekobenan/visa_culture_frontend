import { ControllerProfile, EventDay } from '../entites/entity';
import { ControllerDashboardDto } from './dashbord-controlleur.dto';
export interface IGate {
  gateId: string;
}
export interface IControllerRepository {
  getEventDay(): Promise<EventDay[]>;
  assigneGate(controllerId: string, dto: IGate): Promise<ControllerProfile>;
  getDashboard(controllerId: string): Promise<ControllerDashboardDto>;
}
