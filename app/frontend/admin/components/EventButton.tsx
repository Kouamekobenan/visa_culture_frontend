import { PlusCircle, Edit3, Gift } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SectionButtonProps {
  onAddTicket: () => void;
  onEditEvent: () => void;
  //   onDeleteEvent: () => void;
  onAddLotteryPrize: () => void;
  hasLottery: boolean;
}

export default function SectionButton({
  onAddTicket,
  onEditEvent,
  //   onDeleteEvent,
  onAddLotteryPrize,
  hasLottery,
}: SectionButtonProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 transition-colors shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Groupe Actions Principales */}
        <Button
          onClick={onAddTicket}
          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-all active:scale-95"
        >
          <PlusCircle size={18} />
          <span>Ajouter ticket</span>
        </Button>
        <Button
          onClick={onAddLotteryPrize}
          disabled={!hasLottery} // Désactive le clic
          className={`${
            !hasLottery
              ? 'opacity-50 cursor-not-allowed grayscale' // Style visuel "désactivé"
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white flex items-center gap-2`}
        >
          <Gift size={18} />
          <span>{hasLottery ? 'Prix Tombola' : 'Pas de Tombola'}</span>
        </Button>
        {/* Séparateur vertical (visible uniquement sur desktop) */}
        <div className="hidden md:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Groupe Gestion Événement */}
        <Button
          onClick={onEditEvent}
          variant="outline" // Ou ta classe de bouton secondaire
          className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-all"
        >
          <Edit3 size={18} />
          <span>Modifier</span>
        </Button>
      </div>
    </div>
  );
}
