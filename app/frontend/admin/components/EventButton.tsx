'use client';

import { PlusCircle, Edit3, Gift, History, FileText, AlignStartHorizontal, AlignStartVertical } from 'lucide-react'; // Ajout de FileText
import { Button } from '../../components/ui/Button';
interface SectionButtonProps {
  onAddTicket: () => void;
  onEditEvent: () => void;
  onAddLotteryPrize: () => void;
  onViewHistory: () => void;
  onAnalytic: () => void;
  onPrintSummary: () => void; // Nouvelle Prop pour l'impression
  hasLottery: boolean;
}
export default function SectionButton({
  onAddTicket,
  onEditEvent,
  onAddLotteryPrize,
  onViewHistory,
  onAnalytic,
  onPrintSummary, // On récupère la fonction ici
  hasLottery,
}: SectionButtonProps) {
  const baseBtnClass =
    'flex items-center gap-2 py-2.5 px-4 rounded-xl font-title text-xs font-bold transition-all active:scale-95 border shadow-sm';

  return (
    <div className="w-full bg-surface border border-muted/20 rounded-2xl p-4 mb-6 shadow-sm transition-colors duration-300">
      <div className="flex flex-wrap items-center gap-3">
        {/* BOUTON PRINCIPAL : Ajouter ticket */}
        <Button
          onClick={onAddTicket}
          className={`${baseBtnClass} bg-brand border-brand/20 text-white hover:opacity-90`}
        >
          <PlusCircle size={18} />
          <span>Ajouter ticket</span>
        </Button>
        {/* NOUVEAU BOUTON : IMPRIMER BILAN */}
        <Button
          onClick={onPrintSummary}
          className={`${baseBtnClass} bg-teal-500/10 border-teal-500/20 text-teal-600 hover:bg-teal-500/20`}
        >
          <FileText size={18} className="text-teal-600" />
          <span className="text-foreground">Bilan PDF</span>
        </Button>
        {/* BOUTON HISTORIQUE */}
        <Button
          onClick={onViewHistory}
          className={`${baseBtnClass} bg-surface border-muted/20 text-foreground hover:border-brand/50 hover:bg-brand/5`}
        >
          <History size={18} className="text-brand" />
          <span className="text-foreground">Historique</span>
        </Button>
        <Button
          onClick={onAnalytic}
          className={`${baseBtnClass} bg-surface border-muted/20 text-foreground hover:border-brand/50 hover:bg-brand/5`}
        >
          <AlignStartVertical size={18} className="text-brand" />
          <span className="text-foreground">Données analytics</span>
        </Button>
        {/* BOUTON TOMBOLA */}
        <Button
          onClick={onAddLotteryPrize}
          disabled={!hasLottery}
          className={`${baseBtnClass} ${
            !hasLottery
              ? 'bg-muted/5 border-muted/10 text-muted opacity-60 cursor-not-allowed'
              : 'bg-surface border-muted/20 text-foreground hover:border-brand/50 hover:bg-brand/5'
          }`}
        >
          <Gift
            size={18}
            className={hasLottery ? 'text-brand' : 'text-muted'}
          />
          <span className={hasLottery ? 'text-foreground' : 'text-muted'}>
            {hasLottery ? 'Prix Tombola' : 'Pas de Tombola'}
          </span>
        </Button>

        <div className="hidden md:block h-6 w-[1px] bg-muted/20 mx-1" />

        {/* BOUTON MODIFIER */}
        <Button
          onClick={onEditEvent}
          className={`${baseBtnClass} bg-transparent border-muted/10 !text-muted hover:!text-foreground hover:bg-muted/10 shadow-none transition-colors`}
        >
          <Edit3 size={16} className="text-muted group-hover:text-foreground" />
          <span>Modifier</span>
        </Button>
      </div>
    </div>
  );
}
