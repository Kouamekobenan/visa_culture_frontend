# 🚀 Visa Culture Frontend

Application frontend du projet **Visa Culture**, construite avec **Next.js** et **Tailwind CSS v4**.

---

## ⚙️ Getting Started

Lance le serveur de développement :

```bash
npm run dev
```

## Learn More

## 🎨 Design System & Charte Graphique

Ce projet adopte une approche CSS-first avec Tailwind CSS v4.

La gestion des styles est centralisée dans :

```bash
src/app/globals.css
```

👉 Utilisation de variables CSS natives pour :

🛠️ améliorer la maintenabilité
🌙 faciliter le dark mode
🎯 garantir la cohérence UI

## 🌓 Dark Mode

Le mode sombre est géré dynamiquement via la classe :

```bash
<html class="dark">
```

✔️ Activation sans rechargement
✔️ Compatible avec toutes les pages

## 🎨 Palette de Couleurs (Design System)

| Fonction           | Classe Tailwind | Mode Clair | Mode Sombre |
| ------------------ | --------------- | ---------- | ----------- |
| 🎨 Fond de page    | bg-background   | #FFFFFF    | #030712     |
| 📝 Texte principal | text-foreground | #111827    | #F3F4F6     |
| 🧩 Cartes          | bg-surface      | #F9FAFB    | #111827     |
| 🔥 Titres          | text-title      | #F97316    | #FB923C     |
| ✅ Boutons         | bg-btn          | #22C55E    | #4ADE80     |
| ⚪ Texte discret   | text-muted      | #6B7280    | #9CA3AF     |
| ❌ Erreur          | text-error      | #EF4444    | #EF4444     |

## 🖋️ Typographie (Fonts)

1. Space Grotesk — La police de caractère
   Utilisation : Titres (h1, h2, h3) et éléments d'accentuation.

2. Inter — La police d'interface
   Utilisation : Corps de texte, prix, formulaires et navigation.

## ⚙️ Implémentation Technique -->

Les polices sont intégrées via Tailwind CSS v4 dans le fichier globals.css :

```bash
@theme {
  /* Définition des familles de polices */
  --font-sans: "Inter", ui-sans-serif, system-ui;
  --font-title: "Space Grotesk", sans-serif;
}

@layer base {
  body {
    font-family: var(--font-sans); /* Appliqué par défaut partout */
  }

  h1, h2, h3, .font-title {
    font-family: var(--font-title); /* Appliqué aux titres */
  }
}
```

## Deploy on Vercel

```

```
