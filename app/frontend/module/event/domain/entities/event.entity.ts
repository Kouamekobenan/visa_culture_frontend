interface IOrganizer {
  id: string;
  name: string;
}
export class Event {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public imageUrl: string,
    public location: string,
    public date: string,
    public isActive: boolean,
    public organizerId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public organizer?: IOrganizer,
    public lottery?: ILottery,
  ) {}
}
// INTERFACE

export interface ILottery {
  id: string;
  isActive: boolean;
}

export interface CreateEventDto {
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  date: string;
  isActivate: boolean;
  organizerId: string;
  time?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  date?: Date;
  isActivate?: boolean;
}
