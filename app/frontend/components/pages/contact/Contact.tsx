'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'; // Utilisation de Lucide pour l'UI
import { Button } from '../../ui/Button';
import { MailRepository } from '@/app/frontend/module/mail/infrastructure/mail.repositry';
import { Mail as MailEntity } from '@/app/frontend/module/mail/domain/entities/mail.entity';

const mailService = new MailRepository();

export default function ContactForm() {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    const formData = new FormData(e.currentTarget);
    const data: MailEntity = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      message: formData.get('message')?.toString() || '',
    };

    try {
      await mailService.create(data);
      setStatus('success');
      setFeedback('Votre message a été transmis à nos équipes culturelles !');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus('error');
      setFeedback(
        'Oups, une erreur technique est survenue. Réessayez bientôt.',
      );
    }
  }

  return (
    <section className="max-w-6xl mx-auto my-12 p-4 md:p-8 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Colonne Gauche : Texte Descriptif & Branding */}
        <div className="lg:col-span-2 bg-green-600 p-8 md:p-12 text-white rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-3xl text-title font-bold mb-6 leading-tight">
              Donnez vie à vos projets culturels
            </h2>
            <p className="text-teal-50 text-lg leading-relaxed mb-8">
              VISA FOR CULTURE est bien plus qu&apos;une billetterie. C&apos;est le pont
              entre vos événements et votre public. Une question sur notre API ?
              Un besoin d&apos;accompagnement pour votre festival ? Notre équipe est
              à votre écoute.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Mail size={20} />
                </div>
                <span>contact@visafortculture.com</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Phone size={20} className=''/>
                </div>
                <span>+225 07 00 00 00 00</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <MapPin size={20} />
                </div>
                <span>Abidjan, Côte d&apos;Ivoire</span>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-green-500/50">
            <p className="text-sm italic opacity-80">
              `La culture ne s&apos;hérite pas, elle se conquiert.` – Malraux
            </p>
          </div>
        </div>

        {/* Colonne Droite : Formulaire */}
        <div className="lg:col-span-3 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Nom complet
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ex: Jean Koffi"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="jean@exemple.com"
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Téléphone
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+225..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Sujet
                </label>
                <input
                  name="subject"
                  type="text"
                  placeholder="Partenariat, Support..."
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Votre message
              </label>
              <textarea
                name="message"
                rows={5}
                placeholder="Dites-nous tout sur votre projet..."
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none resize-none"
              ></textarea>
            </div>

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-200 transition-all flex justify-center items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  {' '}
                  <Loader2 className="animate-spin" /> Envoi en cours...{' '}
                </>
              ) : (
                <>
                  {' '}
                  <Send size={18} /> Envoyer ma demande
                </>
              )}
            </Button>

            {feedback && (
              <div
                className={`p-4 rounded-xl text-center text-sm font-bold animate-pulse ${
                  status === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {feedback}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
