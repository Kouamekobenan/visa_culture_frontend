"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
function AppLogo({ spinning }: { spinning: boolean }) {
  return (
    <div
      className={`transition-all duration-500 ${spinning ? "animate-spin-slow" : "scale-110 opacity-90"}`}
      style={{
        animation: spinning ? "spin 2s linear infinite" : "none",
      }}
    >
      {/* Remplace ce SVG par ton <Image src="/logo.svg" ... /> si tu as un vrai logo */}
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="currentColor"
          strokeWidth="3"
          className="text-title"
        />
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="currentColor"
          className="text-btn"
          opacity="0.15"
        />
        <path
          d="M30 50 Q50 20 70 50 Q50 80 30 50Z"
          fill="currentColor"
          className="text-btn"
        />
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="currentColor"
          className="text-title"
        />
      </svg>
    </div>
  );
}
type Phase = "spinning" | "checking" | "done";
export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("spinning");
  const [dots, setDots] = useState("");
  // Animation des "..." pendant le checking
  useEffect(() => {
    if (phase !== "checking") return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [phase]);
  useEffect(() => {
    // ⏱ Étape 1 : logo tourne pendant 10 secondes
    const spinTimer = setTimeout(() => {
      setPhase("checking");

      // ⏱ Étape 2 : vérification du token (courte pause visuelle)
      setTimeout(() => {
        setPhase("done");
        const token = localStorage.getItem("access_token");
        if (token) {
          router.replace("/frontend/page/event");
        } else {
          router.replace("/frontend/page/login");
        }
      }, 200); //2 ms pour la vérification visuelle
    }, 500); // 5 ms secondes de splash
    return () => clearTimeout(spinTimer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 font-sans">
      {/* Logo animé */}
      <div className="flex flex-col items-center gap-6">
        <AppLogo spinning={phase === "spinning"} />

        {/* Nom de l'app */}
        <div className="text-center">
          <h1 className="text-3xl font-title font-bold text-title tracking-tight uppercase">
            Visa For Culture
          </h1>
          <p className="text-muted text-sm mt-1 font-medium">
            Billetterie · Côte d&apos;Ivoire
          </p>
        </div>
      </div>
      {/* Barre de progression */}
      <div className="w-48 h-1 bg-muted/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-btn rounded-full transition-all"
          style={{
            width:
              phase === "spinning"
                ? "75%"
                : phase === "checking"
                  ? "95%"
                  : "100%",
            transition:
              phase === "spinning" ? "width 10s linear" : "width 0.4s ease",
            // Démarre à 0 au montage
            animation: phase === "spinning" ? "none" : undefined,
          }}
        />
      </div>
      {/* Message de statut */}
      <p className="text-xs text-muted font-medium tracking-widest uppercase">
        {phase === "spinning" && "Chargement…"}
        {phase === "checking" && `Vérification${dots}`}
        {phase === "done" && "Redirection…"}
      </p>
    </div>
  );
}
