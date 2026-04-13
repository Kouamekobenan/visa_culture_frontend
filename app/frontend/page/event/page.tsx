
import Header from "../../components/layout/Header";
import ProfessionalAdBanner from "../../components/pages/events/Pub";

export default function PageEvent() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <ProfessionalAdBanner />
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center"></main>
    </div>
  );
}

 