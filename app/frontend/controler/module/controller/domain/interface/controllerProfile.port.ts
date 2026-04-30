import { ControllerProfile, EventDay } from '../entites/entity';
export interface IGate {
  gateId: string;
}
export interface IControllerRepository {
  getEventDay(): Promise<EventDay[]>;
  assigneGate(controllerId: string, dto: IGate): Promise<ControllerProfile>;
}
