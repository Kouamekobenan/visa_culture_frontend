// **** CONSTANTES ****

import { Prize } from '../../module/prizes/domain/entities/prize.entity';

export const NAME = 'VISA FOR CULTURE';
export const SOUS_NAME = 'GESTION DE LA BILLETERIE';

// *** INTERFACE FOR TYPES GENERIQUE ***
export interface PaginatedResponseRepository<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export interface PaternerData {
  id: number;
  name: string;
  logo: string;
  image: string;
}

// *** TYPES ENUMS ***
export enum TicketStatus {
  VALID = 'VALID',
  USED = 'USED',
  CANCELLED = 'CANCELLED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  PARTICIPANT = 'PARTICIPANT',
  CONTROLLER = 'CONTROLLER',
}
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
export enum NotificationType {
  TICKET_PURCHASED = 'TICKET_PURCHASED',
  EVENT_REMINDER = ' EVENT_REMINDER ',
  LOTTERY_WINNER = 'LOTTERY_WINNER',
  PAYMENT_FAILED = ' PAYMENT_FAILED',
  SECURITY_ALERT = 'SECURITY_ALERT',
}

export enum HttpCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
export interface Lottery {
  id: string;
  eventId: string;
  isActivate: string;
  createdAt: Date;
  prizes: Prize[];
}
