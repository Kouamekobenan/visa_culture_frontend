import { TicketData } from "./ModernGlass";

export const CulturalHeritage = ({ data }: { data: TicketData }) => {
  return (
    <div className="w-[380px] h-[550px] bg-[#FFFBF2] rounded-[2.5rem] p-6 border-[8px] border-[#f97316] overflow-hidden text-slate-900 font-sans shadow-2xl relative">
      {/* Motif culturel discret en fond */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/patterns/afro-pattern.png')`,
          backgroundSize: '100px',
        }}
      />

      <div className="relative z-10 h-full flex flex-col items-center text-center justify-between">
        <div className="w-full">
          <div className="bg-[#f97316] text-white py-2 px-6 rounded-b-2xl inline-block font-black text-sm uppercase tracking-widest">
            Visa For Culture
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#f97316] uppercase leading-none">
            {data.eventName}
          </h2>
          <div className="h-1 w-12 bg-slate-900 mx-auto" />
          <p className="text-xs font-bold text-slate-500">
            {data.location} • {data.date}
          </p>
        </div>
        <div className="w-full bg-slate-900 text-white p-6 rounded-3xl space-y-4">
          <div>
            <p className="text-[10px] uppercase opacity-60">Type de Pass</p>
            <p className="text-xl font-black text-orange-400 uppercase italic">
              {data.ticketType}
            </p>
          </div>
          <div className="flex justify-center bg-white p-3 rounded-xl mx-auto w-fit">
            <img src={data.qrCode} alt="QR Code" className="w-24 h-24" />
          </div>

          <p className="text-[10px] font-mono opacity-40">
            #{data.ticketId.toUpperCase()}
          </p>
        </div>

        <div className="w-full flex justify-between items-center border-t border-slate-200 pt-4">
          <div className="text-left">
            <p className="text-[8px] font-bold uppercase text-slate-400">
              Client
            </p>
            <p className="text-sm font-black">{data.userName}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900">
              {data.price.toLocaleString()} F
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
