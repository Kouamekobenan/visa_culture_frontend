import { Calendar, MapPin, Banknote } from 'lucide-react';

export const HorizontalTicket = ({ ticket }: { ticket: any }) => {
  const dateStr = new Date(ticket.event.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="ticket-container w-[190mm] h-[65mm] bg-[#111827] text-white rounded-xl flex relative overflow-hidden shadow-xl mb-[10mm]">
      {/* SECTION GAUCHE : QR & INFOS */}
      <div className="ticket-left w-[30%] bg-gradient-to-br from-[#a5f3fc] to-[#ddd6fe] p-4 flex flex-col items-center justify-between text-[#111827] border-r-2 border-dashed border-black/10">
        <div className="font-[900] text-[18px] tracking-tighter">TICKET</div>
        <div className="flex flex-col items-center gap-1">
          <div className="bg-white p-1.5 rounded-lg">
            <img
              src={ticket.qrDataUrl}
              alt="QR"
              className="w-[80px] h-[80px]"
            />
          </div>
          <div className="font-mono text-[10px] opacity-70">
            {ticket.code.substring(0, 8)}...
          </div>
        </div>
        <div className="text-[10px] font-medium italic">visaForCulture.com</div>
      </div>

      {/* SECTION DROITE : EVENT DETAILS */}
      <div className="ticket-right flex-1 relative flex">
        {/* Image avec masque dégradé */}
        <div
          className="absolute right-0 top-0 w-[60%] h-full opacity-80"
          style={{
            backgroundImage: `url(${ticket.event.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to left, black 60%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to left, black 60%, transparent 100%)',
          }}
        />

        <div className="relative z-10 p-6 flex flex-col justify-center w-[70%]">
          <div className="bg-teal-600 text-white px-3 py-1 rounded-md text-[12px] font-bold w-fit mb-3">
            {ticket.ticketType.name}
          </div>

          <h2 className="font-['Space_Grotesk'] text-[32px] font-bold leading-none uppercase mb-2">
            {ticket.event.title}
          </h2>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Calendar size={14} className="text-teal-400" /> {dateStr}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin size={14} className="text-teal-400" />{' '}
              {ticket.event.location || "Lieu de l'événement"}
            </div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mt-2">
              <Banknote size={18} className="text-teal-400" />{' '}
              {ticket.ticketType.price.toLocaleString()} FCFA
            </div>
          </div>
        </div>

        {/* Lucky Number */}
        {ticket.participation && (
          <div className="absolute bottom-4 right-5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-center">
            <div className="text-[9px] text-cyan-400 font-bold uppercase leading-none">
              Lucky Number
            </div>
            <div className="text-lg font-black italic">
              #{ticket.participation.luckyNumber}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
