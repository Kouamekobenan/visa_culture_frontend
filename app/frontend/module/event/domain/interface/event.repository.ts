import { PaginatedResponseRepository } from "@/app/frontend/utils/types/manager.type";
import { CreateEventDto, Event, UpdateEventDto } from "../entities/event.entity";

export interface IEventRepository {
  create(dto: CreateEventDto): Promise<Event>;
  getEventById(id: string): Promise<Event | null>;
  getAllEvents(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Event>>;
  updateEvent(id: string, data: UpdateEventDto): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
}
