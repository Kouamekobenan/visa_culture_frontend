import Link from "next/link";
import { Button } from "../../components/ui/Button";
import Header from "../../components/layout/Header";

export default function PageEvent(){
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <Header/>
        <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">
          {/* TITRE EN SPACE GROTESK (via font-title) */}
          <Link href="/frontend/page/login">
            <Button>Page Login</Button>
          </Link>
          <h1 className="text-6xl md:text-7xl font-title font-bold text-title tracking-tighter">
            Visa For Culture
          </h1>
          {/* TEXTE EN INTER (via font-sans par défaut) */}
          <p className="text-muted text-lg md:text-xl mt-4 mb-10 max-w-md">
            La plateforme de billetterie moderne pour tous vos événements en
            Côte d&apos;Ivoire.
          </p>
          {/* BOUTON D'ACTION PRINCIPAL */}
          <Button
            size="lg"
            className="rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            Acheter un ticket
          </Button>

          {/* SECTION DEMO CARTE */}
          <div className="mt-16 w-full max-w-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              Aperçu Événement
            </p>

            <div className="bg-surface p-6 rounded-2xl border border-muted/20 shadow-sm text-left">
              <h2 className="text-title text-2xl font-title font-bold">
                Concert VIP
              </h2>
              <p className="text-muted text-sm font-medium">
                Palais de la Culture, 20h00
              </p>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-foreground font-bold text-xl tracking-tight">
                  15 000 FCFA
                </span>
                <Button size="sm">Réserver</Button>
              </div>
            </div>
          </div>
          {/* GALERIE DES BOUTONS (Tests UI) */}
          <div className="mt-20 p-8 bg-surface/50 rounded-3xl border border-dashed border-muted/30">
            <h3 className="text-sm font-bold text-muted mb-6 uppercase">
              Test du Design System
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary">Standard</Button>
              <Button variant="title" size="md">
                Accent Orange
              </Button>
              <Button variant="outline" size="sm">
                Bordure
              </Button>
              <Button isLoading>Chargement</Button>
            </div>
          </div>
        </main>
      </div>
    );
}