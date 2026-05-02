import { ControllerProfile, EventDay } from '../entites/entity';
import {
  ControllerDashboardDto,
  ControllerWithStats,
  CreateProfileDto,
} from './dashbord-controlleur.dto';
export interface IGate {
  gateId: string;
}
export interface Gate {
  id: string;
  name: string;
  eventId: string;
  event: { id: string; title: string; date?: string };
}
export interface ResponseProfile {
  id: string;
  fullName: string;
  photoUrl: string;
  educationLevel: string;
  userId: string;
  gateId: string;
  user: {
    email: string;
    phone: string;
  };
  assignedGate: string;
}
export interface CreateGateDto {
  name: string;
  eventId: string;
}
export interface IControllerRepository {
  getEventDay(): Promise<EventDay[]>;
  assigneGate(controllerId: string, dto: IGate): Promise<ControllerProfile>;
  unassigneGate(id: string): Promise<ControllerProfile>;
  getDashboard(controllerId: string): Promise<ControllerDashboardDto>;
  create(dto: CreateProfileDto): Promise<ResponseProfile>;
  findAllWithStats(): Promise<ControllerWithStats[]>;
  findAllGates(): Promise<Gate[]>;
  delete(id: string): Promise<void>;
  createGate(dto: CreateGateDto): Promise<Gate>;
}
