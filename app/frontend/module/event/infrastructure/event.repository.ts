import { api } from "@/app/backend/database/api";
import {
  CreateEventDto,
  Event,
  UpdateEventDto,
} from "../domain/entities/event.entity";
import { IEventRepository } from "../domain/interface/event.repository";
import { PaginatedResponseRepository } from "@/app/frontend/utils/types/manager.type";
export class EventRepository implements IEventRepository {
  private readonly baseUrl = "events";
  async create(dto: CreateEventDto): Promise<Event> {
    const newEvent = await api.post(this.baseUrl, dto);
    return newEvent.data;
  }
  async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
    const url = `events/${id}`;
    const updateEvent = await api.put(url, data);
    return updateEvent.data;
  }
  async getEventById(id: string): Promise<Event | null> {
    const url = `events/${id}`;
    const event = await api.get(url);
    return event ? event.data : null;
  }
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  }
  async getAllEvents(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Event>> {
    const response = await api.get<PaginatedResponseRepository<Event>>(
      this.baseUrl,
      {
        params: { limit, page },
      },
    );
    return response.data;
  }

  
}


/**  // ✅ Méthode bonus : recherche par titre / filtre
  async searchEvents(
    query: string,
    limit = 10,
    page = 1
  ): Promise<PaginatedResponseRepository<Event>> {
    const response = await api.get<PaginatedResponseRepository<Event>>(
      `${this.baseUrl}/search`,
      {
        params: { q: query, limit, page },
      }
    );
    return response.data;
  }

  // ✅ Méthode bonus : récupérer les événements d'un organisateur
  async getEventsByOrganizer(
    organizerId: string,
    limit = 10,
    page = 1
  ): Promise<PaginatedResponseRepository<Event>> {
    const response = await api.get<PaginatedResponseRepository<Event>>(
      `${this.baseUrl}/organizer/${organizerId}`,
      {
        params: { limit, page },
      }
    );
    return response.data;
  }

  // ✅ Méthode bonus : upload image de couverture
  async uploadCoverImage(id: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{ imageUrl: string }>(
      `${this.baseUrl}/${id}/cover`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  // ✅ Méthode bonus : publier / dépublier un événement
  async togglePublish(id: string, publish: boolean): Promise<Event> {
    const response = await api.patch<Event>(`${this.baseUrl}/${id}/publish`, {
      published: publish,
    });
    return response.data;
  } */