import React from 'react';

export interface TicketData {
  eventName: string;
  userName: string;
  ticketType: string;
  price: number;
  date: string;
  location: string;
  ticketId: string;
  qrCode: string; // Base64 ou URL
}

export const ModernGlass = ({ data }: { data: TicketData }) => {
  return (
    <div className="relative w-[380px] h-[550px] bg-slate-950 rounded-[2.5rem] p-6 overflow-hidden text-white font-sans shadow-2xl">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[250px] h-[250px] bg-teal-500/20 rounded-full blur-[60px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[200px] h-[200px] bg-orange-500/10 rounded-full blur-[50px]" />

      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">
              VISA FOR
              <br />
              <span className="text-teal-400">CULTURE</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mt-1">
              Pass Officiel
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-bold uppercase">
            2026
          </div>
        </header>

        {/* Event Details */}
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5">
            <p className="text-[8px] uppercase tracking-widest text-teal-400 font-bold mb-1">
              Événement
            </p>
            <h2 className="text-lg font-bold leading-tight line-clamp-2">
              {data.eventName}
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] uppercase text-slate-400 font-bold">
                  Date
                </p>
                <p className="text-xs font-medium">{data.date}</p>
              </div>
              <div>
                <p className="text-[8px] uppercase text-slate-400 font-bold">
                  Lieu
                </p>
                <p className="text-xs font-medium line-clamp-1">
                  {data.location}
                </p>
              </div>
            </div>
          </div>

          <div className="px-2">
            <p className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
              Détenteur
            </p>
            <p className="text-sm font-bold uppercase">{data.userName}</p>
          </div>
        </div>

        {/* Footer & QR */}
        <footer className="flex items-end justify-between pt-6 border-t border-white/10">
          <div className="space-y-1">
            <div className="bg-orange-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase inline-block">
              {data.ticketType}
            </div>
            <p className="text-2xl font-black tracking-tighter">
              {data.price.toLocaleString()} XOF
            </p>
            <p className="text-[8px] font-mono text-slate-500">
              ID: {data.ticketId.split('-')[0]}
            </p>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-xl">
            <img src={data.qrCode} alt="QR Code" className="w-20 h-20" />
          </div>
        </footer>
      </div>
    </div>
  );
};
