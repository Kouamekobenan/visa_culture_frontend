"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Lock, Phone, Eye, EyeOff, ChevronLeft, ArrowRight, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "../../ui/Button";
import ThemeToggle from "../../ui/ThemeToggle";
import { ApiErrorResponse, NAME, UserRole } from "@/app/frontend/utils/types/manager.type";
import { RegisterDto } from "@/app/frontend/module/authentification/domain/entities/user.entity";
import { UserRepository } from "@/app/frontend/module/authentification/infrastructure/user.repository";
import { UserService } from "@/app/frontend/module/authentification/application/user.service";
import axios from "axios";
//  Liste des pays avec drapeaux (images SVG via flagcdn.com)
const COUNTRY_CODES = [
  { code: "+225", iso: "ci", label: "Côte d'Ivoire" },
  { code: "+33",  iso: "fr", label: "France" },
  { code: "+1",   iso: "us", label: "États-Unis" },
  { code: "+44",  iso: "gb", label: "Royaume-Uni" },
  { code: "+221", iso: "sn", label: "Sénégal" },
  { code: "+223", iso: "ml", label: "Mali" },
  { code: "+226", iso: "bf", label: "Burkina Faso" },
  { code: "+237", iso: "cm", label: "Cameroun" },
  { code: "+242", iso: "cg", label: "Congo" },
  { code: "+243", iso: "cd", label: "RD Congo" },
  { code: "+212", iso: "ma", label: "Maroc" },
  { code: "+213", iso: "dz", label: "Algérie" },
  { code: "+216", iso: "tn", label: "Tunisie" },
  { code: "+234", iso: "ng", label: "Nigeria" },
  { code: "+233", iso: "gh", label: "Ghana" },
  { code: "+245", iso: "gw", label: "Guinée-Bissau" },
  { code: "+224", iso: "gn", label: "Guinée" },
  { code: "+232", iso: "sl", label: "Sierra Leone" },
  { code: "+229", iso: "bj", label: "Bénin" },
  { code: "+228", iso: "tg", label: "Togo" },
  { code: "+227", iso: "ne", label: "Niger" },
  { code: "+32",  iso: "be", label: "Belgique" },
  { code: "+41",  iso: "ch", label: "Suisse" },
  { code: "+49",  iso: "de", label: "Allemagne" },
  { code: "+34",  iso: "es", label: "Espagne" },
  { code: "+39",  iso: "it", label: "Italie" },
  { code: "+351", iso: "pt", label: "Portugal" },
  { code: "+1",   iso: "ca", label: "Canada" },
  { code: "+55",  iso: "br", label: "Brésil" },
  { code: "+86",  iso: "cn", label: "Chine" },
];

// ✅ Composant Flag Image
function FlagImg({ iso, size = 20 }: { iso: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={iso}
      width={size}
      height={Math.round(size * 0.75)}
      className="rounded-sm object-cover shrink-0"
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}
// ✅ Composant Dropdown Pays custom
function CountryDropdown({
  value,
  onChange,
}: {
  value: (typeof COUNTRY_CODES)[0];
  onChange: (country: (typeof COUNTRY_CODES)[0]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  // Fermer si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus sur la recherche à l'ouverture
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="flex items-center gap-2 px-3 py-3.5 bg-muted/10 border-r border-muted/20 hover:bg-muted/20 transition-colors rounded-l-2xl h-full focus:outline-none"
      >
        <FlagImg iso={value.iso} />
        <span className="text-sm font-medium text-foreground">{value.code}</span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-surface border border-muted/20 rounded-2xl shadow-2xl w-64 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-muted/10">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un pays..."
              className="w-full px-3 py-2 text-sm bg-background border border-muted/20 rounded-xl focus:outline-none text-foreground placeholder:text-muted/50"
            />
          </div>

          {/* Liste */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted text-center">Aucun résultat</li>
            ) : (
              filtered.map((country) => (
                <li key={country.iso + country.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(country);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/10 transition-colors text-left ${
                      value.iso === country.iso && value.code === country.code
                        ? "bg-muted/10 font-semibold"
                        : ""
                    }`}
                  >
                    <FlagImg iso={country.iso} />
                    <span className="text-foreground flex-1">{country.label}</span>
                    <span className="text-muted text-xs">{country.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterDto>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: UserRole.PARTICIPANT,
  });

  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Côte d'Ivoire par défaut
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterDto, string>>>({});

  const userRepo = new UserRepository();
  const createUserUseCase = new UserService(userRepo);

  const validateField = (name: keyof RegisterDto, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (value.trim().length < 3) error = "Le nom doit contenir au moins 3 caractères";
        break;
      case "password":
        if (value.length < 6) error = "Minimum 6 caractères";
        break;
      case "phone":
        const phoneRegex = /^[0-9]{6,15}$/;
        if (value && !phoneRegex.test(value.replace(/\s/g, "")))
          error = "Numéro invalide (chiffres uniquement)";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name as keyof RegisterDto, value);
  };

  // ✅ Gestion du numéro local
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "");
    setPhoneNumber(raw);
    setFormData((prev) => ({
      ...prev,
      phone: raw ? `${selectedCountry.code}${raw}` : "",
    }));
    validateField("phone", raw);
  };

  // ✅ Changement de pays
  const handleCountryChange = (country: (typeof COUNTRY_CODES)[0]) => {
    setSelectedCountry(country);
    setFormData((prev) => ({
      ...prev,
      phone: phoneNumber ? `${country.code}${phoneNumber}` : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isNameValid = validateField("name", formData.name);
    const isPasswordValid = validateField("password", formData.password);
    const isPhoneValid = phoneNumber ? validateField("phone", phoneNumber) : true;

    if (!isNameValid || !isPasswordValid || !isPhoneValid) {
      toast.error("Veuillez corriger les erreurs.");
      setLoading(false);
      return;
    }

    try {
      const response = await createUserUseCase.createUser({
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });

      if (response.token) {
        localStorage.setItem("access_token", response.token.accessToken);
        // localStorage.setItem("refresh_token", response.token.refreshToken);
        localStorage.setItem("refreshToken", response.token.refreshToken);
      }

      toast.success(`Bienvenue ${formData.name} !`);
      router.push("/frontend/page/event");
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        toast.error(error.message || "Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans relative">
      <div className="absolute top-6 right-2 flex items-center gap-3">
        <ThemeToggle />
        <Link href="/frontend/page/event">
          <span className="flex items-center gap-2 text-title font-title font-medium hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
            <Button variant="outline">Suivant</Button>
          </span>
        </Link>
      </div>
      <div className="w-full max-w-md py-8 mt-8">
        <div className="bg-surface rounded-3xl p-8 border border-muted/20 shadow-xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-title uppercase tracking-tight mb-2">{NAME}</h2>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">Créer un compte</h3>
            <p className="text-muted mt-2 font-medium text-sm">
              Créer un compte pour commencer à participer aux événements
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom Complet */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                Nom complet
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full pl-12 pr-4 py-3.5 bg-background border-2 rounded-2xl focus:outline-none transition-all text-foreground placeholder:text-muted/50 focus:border-muted ${
                    errors.name ? "border-error" : "border-muted/20"
                  }`}
                  required
                />
              </div>
              {errors.name && <p className="text-[10px] text-error font-bold ml-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-background border-2 rounded-2xl focus:outline-none transition-all text-foreground placeholder:text-muted/50 focus:border-muted ${
                    errors.email ? "border-error" : "border-muted/20"
                  }`}
                />
              </div>
            </div>

            {/* ✅ Téléphone avec dropdown pays custom */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                Téléphone
              </label>
              <div
                className={`flex border-2 rounded-2xl overflow-visible bg-background transition-all focus-within:border-muted ${
                  errors.phone ? "border-error" : "border-muted/20"
                }`}
              >
                {/* Dropdown pays */}
                <CountryDropdown value={selectedCountry} onChange={handleCountryChange} />

                {/* Champ numéro */}
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="0102020304"
                    className="w-full pl-10 pr-4 py-3.5 bg-transparent focus:outline-none text-foreground placeholder:text-muted/50"
                  />
                </div>
              </div>

              {/* Aperçu numéro complet */}
              {phoneNumber && !errors.phone && (
                <p className="text-[10px] text-muted ml-1">
                  Enregistré : <span className="font-bold text-foreground">{selectedCountry.code}{phoneNumber}</span>
                </p>
              )}
              {errors.phone && (
                <p className="text-[10px] text-error font-bold ml-1">{errors.phone}</p>
              )}
            </div>

            {/* Mot de Passe */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 bg-background border-2 rounded-2xl focus:outline-none transition-all text-foreground placeholder:text-muted/50 focus:border-muted ${
                    errors.password ? "border-error" : "border-muted/20"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-error font-bold ml-1">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-btn hover:opacity-90 text-white font-title font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>CRÉER MON COMPTE</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <span className="text-xs uppercase text-muted font-bold tracking-widest px-2 bg-surface">
              DÉJÀ INSCRIT ?
            </span>
          </div>

          <Link href="/frontend/page/login">
            <Button
              variant="outline"
              className="w-full py-6 border-2 border-title text-title hover:bg-title hover:text-white font-title font-bold rounded-2xl transition-all"
            >
              SE CONNECTER
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}