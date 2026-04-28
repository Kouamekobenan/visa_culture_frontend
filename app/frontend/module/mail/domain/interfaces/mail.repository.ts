import { Mail } from '../entities/mail.entity';

export interface IMailRepository {
  create(dto: Mail): Promise<void>;
}
