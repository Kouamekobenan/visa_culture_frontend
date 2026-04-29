import { User } from '../../../authentification/domain/entities/user.entity';
import { Ticket } from '../../../tickets/domain/entities/ticket.entity';

export class ControllerProfile {
  constructor(
    private readonly id: string,
    private fullName: string,
    private photoUrl: string | null,
    private educationLevel: string | null,
    private readonly userId: string,
    private gateId: string | null,
    private scannedTickets?: Ticket[],
    private gate?: [],
    private user?: User,
  ) {}
}

export interface IprofileController{
    fullName:string,
    photoUrl:string,
    educationLevel:string,
    userId:string,
}