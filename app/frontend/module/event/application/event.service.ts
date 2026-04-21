import {
  Lottery,
  PaginatedResponseRepository,
} from '@/app/frontend/utils/types/manager.type';
import {
  CreateEventDto,
  Event,
  UpdateEventDto,
} from '../domain/entities/event.entity';
import { IEventRepository } from '../domain/interface/event.repository';
export class EventService {
  constructor(private readonly eventRepository: IEventRepository) {}
  async create(dto: CreateEventDto, file?: File | null): Promise<Event> {
    return await this.eventRepository.create(dto, file);
  }
  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    return await this.eventRepository.updateEvent(id, dto);
  }
  async findOne(id: string): Promise<Event | null> {
    return await this.eventRepository.getEventById(id);
  }
  async findAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Event>> {
    return await this.eventRepository.getAllEvents(limit, page);
  }
  async deleteEvent(id: string): Promise<void> {
    await this.eventRepository.deleteEvent(id);
  }
  async searchByTitle(title: string): Promise<Event[]> {
    return await this.eventRepository.searchEventsByTitle(title);
  }
  async findPrizeEvent(event: string): Promise<Lottery[]> {
    return await this.eventRepository.findPrizeEvent(event);
  }
}
