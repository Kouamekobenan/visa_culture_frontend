import {
  WhatsAppMessageStatus,
  WhatsAppMessageType,
} from '../enums/whatsApp.enum';

export class WhatsAppLogEntity {
  constructor(
    public readonly id: string,
    public readonly phone: string,
    public readonly type: WhatsAppMessageType,
    public readonly status: WhatsAppMessageStatus,
    public readonly sentAt: string,
    public readonly eventName?: string,
    public readonly errorMessage?: string,
    public readonly ultramsgMessageId?: string,
    public readonly userId?: string,
  ) {}
}
