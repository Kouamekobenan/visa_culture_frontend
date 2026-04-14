export class TicketType {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public quantity: number | null,
    public maxPerUser: number | null,
    public saleStart: Date | null,
    public saleEnd: Date | null,
    public eventId: string,
    public createdAt: Date,
  ) {}
}
export interface CreateTicketTypeDTO {
  name: string;
  price: number;
  quantity: number;
  maxPerUser: number;
  saleStart: Date;
  saleEnd: Date;
  eventId: string;
}
export interface UpdateTicketTypeDTO{
  name?: string;
  price?: number;
  quantity?: number;
  maxPerUser?: number;
  saleStart?: Date;
  saleEnd?: Date;
  eventId?: string;
}
