import { DrawWinnerDto } from '@/app/frontend/module/draws/domains/entities/draws.entity';
import { DrawRepository } from '@/app/frontend/module/draws/infrastructure/draws.repository';
import {
  Award,
  Crown,
  Mail,
  Sparkles,
  Star,
  Trophy,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface DrawsWinnersProps {
  lotteryId: string;
  eventTitle: string;
  onClose: () => void;
}
const drawsRepositoryService = new DrawRepository();

export const DrawsWinners = ({
  lotteryId,
  eventTitle,
  onClose,
}: DrawsWinnersProps) => {
  const [winner, setWinner] = useState<DrawWinnerDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataWinner = async () => {
      try {
        setLoading(true);
        const result = await drawsRepositoryService.findWinner(lotteryId);

        // On vérifie si le tableau contient au moins un gagnant
        if (Array.isArray(result) && result.length > 0) {
          setWinner(result[0]); // On prend le premier élément
        } else {
          setWinner(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du gagnant:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDataWinner();
  }, [lotteryId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Le conteneur principal avec une hauteur maximale pour éviter de sortir de l'écran */}
      <div className="relative w-full max-w-3xl bg-surface dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in my-auto max-h-[95vh] flex flex-col">
        {/* Bouton fermeture - Augmentation du z-index pour rester cliquable */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 cursor-pointer rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Header avec gradient - shrink-0 pour ne pas qu'il s'écrase */}
        <div className="relative h-32 bg-gradient-to-r from-orange-500 via-red-500 to-muted overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-2">
                <Crown className="w-8 h-8 text-yellow-300 animate-bounce" />
                <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
                  Grand Gagnant
                </h2>
                <Crown className="w-8 h-8 text-yellow-300 animate-bounce" />
              </div>
              <p className="text-sm text-white/90 font-medium">{eventTitle}</p>
            </div>
          </div>
          {/* Particules décoratives */}
          <div className="absolute top-2 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute bottom-4 right-20 w-3 h-3 bg-pink-300 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
        {/* Zone de Contenu Scrollable */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted text-sm">
                Chargement des informations du gagnant...
              </p>
            </div>
          ) : winner ? (
            <div className="p-6 md:p-8 space-y-6">
              {/* Numéro gagnant */}
              <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-dashed border-yellow-400">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-muted">
                    Numéro Chanceux
                  </span>
                </div>
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  {winner.luckyNumber}
                </div>
              </div>
              {/* Informations du gagnant */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-4 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-brand" />
                  <h3 className="text-lg font-bold text-title">
                    Informations du Gagnant
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-surface dark:bg-gray-800 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted">Nom complet</p>
                      <p className="font-semibold text-foreground truncate">
                        {winner.user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-surface dark:bg-gray-800 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted">Adresse email</p>
                      <p className="font-semibold text-foreground truncate">
                        {winner.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Prix gagné */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-4">
                  <Trophy className="w-6 h-6 text-brand" />
                  <h3 className="text-lg font-bold text-title">
                    Prix Remporté
                  </h3>
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-30"></div>
                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl">
                      <Image
                        src={winner.prize?.imageUrl ?? '/placeholder-prize.png'}
                        fill
                        className="object-cover"
                        alt={winner.prize?.title ?? 'Prix'}
                      />
                    </div>
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-2xl md:text-3xl font-black text-foreground mb-2">
                      {winner.prize?.title}
                    </h4>
                    <p className="text-muted leading-relaxed">
                      {winner.prize?.description ||
                        'Un prix exceptionnel vous attend !'}
                    </p>
                    <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-btn/10 text-btn rounded-full text-sm font-bold">
                      <Star className="w-4 h-4" />
                      <span>Félicitations pour votre victoire !</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
              <p className="text-muted">Aucun gagnant trouvé pour ce tirage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
