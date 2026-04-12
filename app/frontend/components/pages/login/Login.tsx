"use client";
import { useAuth } from "@/app/frontend/context/useContext";
import { LoginDto } from "@/app/frontend/module/authentification/domain/entities/user.entity";
import {
  ApiErrorResponse,
  NAME,
} from "@/app/frontend/utils/types/manager.type";
import axios from "axios";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserPlus,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../ui/Button";
import ThemeToggle from "../../ui/ThemeToggle";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginDto>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;
    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est requise";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({ email: "", password: "", general: "" });
    try {
      await login(formData.email, formData.password);
      router.push("/page/events");
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setErrors((prev) => ({ ...prev, general: "Identifiants incorrects" }));
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans relative">
      {/* Bouton Suivant (Passer) - Positionné à gauche en Absolute */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <ThemeToggle />
        <Link href="/frontend/page/event">
          <span className="flex items-center gap-2 text-title font-title font-medium hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
            <Button variant="outline">Suivant</Button>
          </span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {/* Card utilisant la variable --surface */}
        <div className="bg-surface rounded-3xl  p-8 border border-muted/20">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <h2 className="text-3xl font-bold text-title uppercase tracking-tight">
                {NAME}
              </h2>
            </div>
            {/* Utilise la police Space Grotesk via h3 */}
            <h3 className="text-3xl font-bold text-foreground  tracking-tight">
              Connexion
            </h3>
            <p className="text-muted mt-2 font-medium">
              Connectez-vous pour accéder à votre compte et découvrir des
              événéments
            </p>
          </div>
          {errors.general && (
            <div className="mb-6 p-3 bg-error/10 border-l-4 border-error rounded-r-lg">
              <p className="text-xs text-error font-bold">{errors.general}</p>
            </div>
          )}
          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                Adresse Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted group-focus-within:text-muted/10 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-background border-2 rounded-2xl focus:outline-none transition-all ${
                    // On définit ici la couleur du texte (foreground) et la bordure au focus
                    "text-foreground placeholder:text-muted/50 focus:border-muted "
                  } ${errors.email ? "border-error" : "border-muted/20"}`}
                  placeholder="nom@exemple.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-error font-bold ml-1">
                  {errors.email}
                </p>
              )}
            </div>
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted group-focus-within:text-muted/10 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-background border-2 rounded-2xl focus:outline-none transition-all ${"text-foreground placeholder:text-muted/50 focus:border-muted "} ${errors.password ? "border-error" : "border-muted/20"}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-muted/10 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {/* Submit Button utilisant --color-btn (Vert) */}
            <Button
              size="lg"
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-btn hover:opacity-90 text-white font-title font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="flex gap-2">
                  <span> SE CONNECTER</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>
          <div className="relative my-8 text-center">
            <span className="text-xs uppercase text-muted font-bold tracking-widest">
              OU
            </span>
          </div>
          {/* Register Link utilisant --color-title (Orange) */}
          <Link href="/frontend/page/registers">
            <Button
              variant="outline"
              className="w-full group flex items-center justify-center space-x-2 py-4 border-2  font-title font-bold rounded-2xl "
            >
              <UserPlus className="w-5 h-5" />
              <span>CRÉER MON COMPTE</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
