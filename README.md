

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```



## Learn More

🎨 Charte Graphique & Design System

Ce projet utilise une architecture CSS-first basée sur Tailwind CSS v4. La gestion du thème est centralisée dans le fichier src/app/globals.css via des variables CSS natives pour faciliter la maintenance.

🌓 Mode Sombre (Dark Mode)
Le site supporte nativement le mode sombre via la classe .dark appliquée sur l'élément <html>. Le basculement se fait dynamiquement sans rechargement de page.

🎨 Palette de Couleurs (Design System)

Fonction,Classe Tailwind,Mode Clair,Mode Sombre
Fond de page,bg-background,#FFFFFF,#030712
Texte principal,text-foreground,#111827,#F3F4F6
Cartes & Sections,bg-surface,#F9FAFB,#111827
Titres (Orange),text-title,#F97316,#FB923C
Boutons (Vert),bg-btn,#22C55E,#4ADE80
Texte discret,text-muted,#6B7280,#9CA3AF
Erreur/Alerte,text-error,#EF4444,#EF4444


## Deploy on Vercel
