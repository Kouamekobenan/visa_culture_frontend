import { User } from "@/app/frontend/module/authentification/domain/entities/user.entity";
import { Ticket } from "@/app/frontend/module/tickets/domain/entities/ticket.entity";

export class ControllerProfile {
  constructor(
    private readonly id: string,
    private fullName: string,
    private photoUrl: string | null,
    private educationLevel: string | null,
    private readonly userId: string,
    private gateId: string | null,
    private scannedTickets?: Ticket[],
    private gate?: IGates,
    private user?: User,
  ) {}}



export interface EventDay {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  totalTickets: number;
  gates: IGates[];
  ticketTypes: ITicketTypes[];
}

export interface IGates {
  id: string;
  name: string;
}
export interface ITicketTypes {
  id: string;
  name: string;
  price: number;
}
