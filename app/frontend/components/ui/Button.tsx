"use client"; // Nécessaire car un bouton a souvent un onClick

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "title" | "error";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}
export const Button = ({
  children,
  variant = "primary", // Vert par défaut
  size = "md",
  isLoading,
  className = "",
  ...props
}: ButtonProps) => {
  // 1. Styles de base (communs à tous les boutons)
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  // 2. Variantes de couleurs (utilisant tes variables de globals.css)
  const variants = {
    primary: "bg-btn text-white hover:opacity-90 shadow-md",
    outline: "border-2 border-btn text-btn hover:bg-btn hover:text-white",
    title: "bg-title text-white hover:opacity-90 shadow-md",
    error: "bg-error text-white hover:opacity-90",
  };

  // 3. Tailles
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Chargement...
        </span>
      ) : (
        children
      )}
    </button>
  );
};


// Utilisation dans les composants
/**import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="p-10 flex flex-col gap-4">
      <Button>Acheter (Vert)</Button>
      
      <Button variant="title" size="lg">
        Gros Bouton Orange
      </Button>
      
      <Button variant="outline" size="sm">
        Petit contour
      </Button>
      
      <Button isLoading>En cours...</Button>
    </div>
  );
} */