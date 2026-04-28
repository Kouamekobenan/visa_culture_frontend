'use client';

import { useState } from 'react';
import { Button } from '../../ui/Button';
import { MailRepository } from '@/app/frontend/module/mail/infrastructure/mail.repositry';
import { Mail } from '@/app/frontend/module/mail/domain/entities/mail.entity';
const mailService = new MailRepository();
export default function ContactForm() {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.currentTarget);

    // Correction ici : on force la conversion en string et on gère le cas vide
    const data: Mail = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      message: formData.get('message')?.toString() || '',
    };
    try {
      const mess = await mailService.create(data);
      console.log('message', mess);
      setStatus('success');
      setMessage('Votre message a été envoyé avec succès !');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus('error');
      setMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  }
  return (
    <div className="max-w-lg mx-auto p-8 bg-background rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Contactez-nous</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nom complet *
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              name="phone"
              type="text"
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sujet *
          </label>
          <input
            name="subject"
            type="text"
            required
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message *
          </label>
          <textarea
            name="message"
            rows={4}
            required
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          ></textarea>
        </div>

        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full  text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400"
        >
          {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
        </Button>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
