import { api } from "@/app/backend/database/api";
import { Mail } from "../domain/entities/mail.entity";
import { IMailRepository } from "../domain/interfaces/mail.repository";

export class MailRepository implements IMailRepository {
  async create(dto: Mail): Promise<void> {
    try {
      const response = await api.post(`/contact`, dto);

      // Si tu n'utilises pas Axios mais fetch, il faut vérifier response.ok
      // Si c'est Axios, il jette une erreur automatiquement pour les status != 2xx
      return response.data;
    } catch (error) {
      console.error('Erreur détaillée dans le Repo:', error);
      throw error; // TRÈS IMPORTANT : permet au try/catch du composant de détecter l'échec
    }
  }
}
