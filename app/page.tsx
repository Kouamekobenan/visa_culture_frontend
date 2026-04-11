// src/app/page.tsx
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background font-sans">
      {/* Utilisation de l'Orange pour le grand titre */}
      <h1 className="text-5xl font-extrabold text-title">Projet Billetterie</h1>
      <p className="text-foreground mt-4 mb-8">Bienvenue sur Visa Culture</p>
      {/* Utilisation du Vert pour le bouton */}
      <button className="bg-btn text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
        Acheter un ticket
      </button>
      <div className="bg-surface mt-3 p-6 rounded-xl border border-muted/20 shadow-sm">
        <h2 className="text-title text-xl font-bold">Concert VIP</h2>
        <p className="text-muted text-sm">Palais de la Culture, 20h00</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-foreground font-bold text-lg">15 000 FCFA</span>
          <button className="bg-btn text-white px-4 py-2 rounded-lg font-medium">
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
