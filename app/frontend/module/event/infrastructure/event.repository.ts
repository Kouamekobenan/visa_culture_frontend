import { api } from '@/app/backend/database/api';
import {
  CreateEventDto,
  Event,
  UpdateEventDto,
} from '../domain/entities/event.entity';
import { IEventRepository } from '../domain/interface/event.repository';
import {
  Lottery,
  PaginatedResponseRepository,
} from '@/app/frontend/utils/types/manager.type';
export class EventRepository implements IEventRepository {
  private readonly baseUrl = 'events';
  async create(dto: CreateEventDto, file?: File | null): Promise<Event> {
    let response; 
    if (file) {
      const formData = new FormData();
      formData.append('imageUrl', file);
      formData.append('title', dto.title);
      formData.append('description', dto.description);
      formData.append('location', dto.location);
      formData.append('date', dto.date);
      formData.append('isActivate', String(dto.isActivate));
      formData.append('organizerId', dto.organizerId);
      response = await api.post(this.baseUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      // Si pas de fichier, on envoie le DTO normalement
      response = await api.post(this.baseUrl, dto);
    }

    // On retourne directement la donnée de la réponse obtenue dans le bloc if/else
    return response.data;
  }
  // ...existing code...
  async updateEvent(
    id: string,
    data: UpdateEventDto,
    file?: File | null,
  ): Promise<Event> {
    let resonse;
    if (file) {
      const formData = new FormData();
      formData.append('imageUrl', file);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('date', data.date);
      formData.append('isActivate', String(data.isActivate));
      // Removed organizerId append due to type error; add to UpdateEventDto if needed
      resonse = await api.put(this.baseUrl + `/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      resonse = await api.put(this.baseUrl + `/${id}`, data);
    }
    return resonse.data;
  }
  // ...existing code...
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
    const res = await api.get(`/events/?page=${page}&limit=${limit}`);
    return {
      data: res.data.data,
      total: res.data.total,
      totalPages: res.data.totalPages,
      limit: res.data.limit,
      page: res.data.page,
    };
  }
  // event.service.ts
  async searchEventsByTitle(title: string): Promise<Event[]> {
    const res = await api.get(
      `/events/search?title=${encodeURIComponent(title)}`,
    );
    // ✅ On renvoie res.data.results car c'est là qu'est le tableau
    return res.data?.results || res.data?.data || res.data || [];
  }

  async findPrizeEvent(event: string): Promise<Lottery[]> {
    const res = await api(`/lotteries/prizes/${event}`);
    return res.data;
  }
  async toggleEventStatus(id: string): Promise<Event> {
    const res = await api.patch(`/events/${id}/toggle-status`);
    return res.data;
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
