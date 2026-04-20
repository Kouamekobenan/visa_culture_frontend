// app/controller/scan/page.tsx
'use client';

import { TicketService } from '@/app/frontend/module/tickets/application/ticket.service';
import { HistoriqueTicketDto } from '@/app/frontend/module/tickets/domain/entities/ticket.entity';
import { TicketRepository } from '@/app/frontend/module/tickets/infrastructure/ticket.repository';
import { useQRScanner } from '@/app/frontend/utils/hooks/useQRScanner';
import { formatFullDateTime } from '@/app/frontend/utils/types/conversion.data';
import { useState, useCallback } from 'react';
import { Button } from '../../ui/Button';
import Link from 'next/link';
const ticketService = new TicketService(new TicketRepository());
export default function ScannerPage() {
  const [result, setResult] = useState<HistoriqueTicketDto | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = useCallback(async (code: string) => {
    setLoading(true);
    setResult(null);

    try {
      const data = await ticketService.scanTicket(code);
      if (!data) {
        setResult(data);
        return;
      }

      setResult(data);
    } catch (error) {
      console.error('Erreur lors du scan du ticket:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = () => {
    setResult(null);
    startScanning();
  };

  const { videoRef, startScanning, stopScanning, isScanning, error } =
    useQRScanner(handleScan);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 bg-gray-900 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm">
            🎫
          </div>
          <div>
            <h1 className="font-bold text-sm">Contrôleur</h1>
            <p className="text-xs text-gray-400">Scanner de tickets</p>
          </div>
        </div>
        <Link href="/frontend/page/profile" className="ml-auto">
          <Button variant="outline" className="text-white">
            Retour
          </Button>
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Zone caméra */}
        {!result && (
          <div className="w-full max-w-sm">
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-square">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline // Important sur iOS !
              />
              {/* Overlay de visée */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-teal-400 rounded-xl relative">
                    {/* Coins animés */}
                    <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                    <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
                    {/* Ligne de scan animée */}
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-teal-400 animate-bounce" />
                  </div>
                </div>
              )}

              {/* État idle */}
              {!isScanning && !loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                  <p className="text-gray-400 text-sm">Caméra inactive</p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-300">Vérification...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Erreur caméra */}
            {error && (
              <p className="text-red-400 text-sm text-center mt-3">{error}</p>
            )}

            {/* Boutons */}
            <div className="flex gap-3 mt-4">
              {!isScanning ? (
                <Button
                  onClick={startScanning}
                  className="flex-1  text-white font-bold py-3 rounded-xl transition"
                >
                  📷 Lancer le scan
                </Button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
                >
                  ⏹ Arrêter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Résultat du scan */}
        {result && <ScanResultCard result={result} onReset={handleReset} />}
      </main>
    </div>
  );
}
// ─── Composant résultat ───────────────────────────────────────────────────────
function ScanResultCard({
  result,
  onReset,
}: {
  result: HistoriqueTicketDto | null;
  onReset: () => void;
}) {
  const config = {
    VALID: {
      bg: 'bg-green-900/50',
      border: 'border-green-500',
      icon: '✅',
      title: 'Accès autorisé',
      titleColor: 'text-green-400',
    },
    USED: {
      bg: 'bg-yellow-900/50',
      border: 'border-yellow-500',
      icon: '⚠️',
      title: 'Déjà scanné',
      titleColor: 'text-yellow-400',
    },
    CANCELLED: {
      bg: 'bg-red-900/50',
      border: 'border-red-500',
      icon: '🚫',
      title: 'Ticket annulé',
      titleColor: 'text-red-400',
    },
  }[result?.status || 'CANCELLED']; // Par défaut, on traite les erreurs comme des tickets annulés
  return (
    <div
      className={`w-full max-w-sm rounded-2xl border ${config.border} ${config.bg} p-6`}
    >
      {/* Icône + titre */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{config.icon}</div>
        <h2 className={`text-2xl font-bold ${config.titleColor}`}>
          {config.title}
        </h2>
      </div>
      {/* Infos participant — uniquement si VALID */}
      {result?.buyerName && (
        <div className="bg-gray-800/50 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <p className="text-xs text-gray-400 uppercase">Participant</p>
            <p className="font-semibold">{result.buyerName}</p>
          </div>
          {result.buyerPhone && (
            <div>
              <p className="text-xs text-gray-400 uppercase">Téléphone</p>
              <p className="font-semibold">{result.buyerPhone}</p>
            </div>
          )}
          {result?.ticketType && (
            <>
              <div>
                <p className="text-xs text-gray-400 uppercase">
                  Type de ticket
                </p>
                <p className="font-semibold">{result?.ticketType.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Événement</p>
                <p className="font-semibold">{result?.event.title}</p>
              </div>
            </>
          )}
        </div>
      )}
      {/* Cas ALREADY_USED — afficher quand */}
      {result?.status === 'USED' && result.event && (
        <div className="bg-yellow-900/30 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 uppercase">Scanné le</p>
          <p className="font-semibold">
            {formatFullDateTime(result?.createdAt ?? new Date())}
          </p>
          {result.buyerName && (
            <p className="text-sm text-gray-300 mt-1">par {result.buyerName}</p>
          )}
        </div>
      )}
      {/* Bouton scanner suivant */}
      <button
        onClick={onReset}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition mt-2"
      >
        📷 Scanner un autre ticket
      </button>
    </div>
  );
}
