export class Event {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public imageUrl: string,
    public location: string,
    public date: Date,
    public isActive: boolean,
    public organizerId: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
// INTERFACE

export interface CreateEventDto {
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  date: Date;
  isActivate: boolean;
  organizerId: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  date?: Date;
  isActivate?: boolean;
}
