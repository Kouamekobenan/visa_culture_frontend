'use client';

import { useAuth } from '@/app/frontend/context/useContext';
import { LoginDto } from '@/app/frontend/module/authentification/domain/entities/user.entity';
import {
  ApiErrorResponse,
  NAME,
} from '@/app/frontend/utils/types/manager.type';
import axios from 'axios';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserPlus,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { Button } from '../../ui/Button';
import ThemeToggle from '../../ui/ThemeToggle';
import { UserRepository } from '@/app/frontend/module/authentification/infrastructure/user.repository';
import { UserService } from '@/app/frontend/module/authentification/application/user.service';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const userRepo = new UserRepository();
  const userService = new UserService(userRepo);
  // --- ÉTATS ---
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 chiffres pour ton JSON
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Pass
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });
  // --- RÉFÉRENCES POUR L'AUTO-FOCUS OTP ---
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- VALIDATIONS ---
  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '', general: '' };
    let isValid = true;
    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est requise";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }

    if (!isForgotPassword && !formData.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  // --- GESTIONNAIRES D'ACTIONS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors])
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      if (!isForgotPassword) {
        // --- LOGIN CLASSIQUE ---
        await login(formData.email, formData.password);
        router.push('/frontend/page/event');
      } else if (isForgotPassword && step === 1) {
        // --- DEMANDE D'OTP (STEP 1) ---
        // const otp = await userService.forgotpassword({ email: formData.email });
        await axios.post('http://localhost:3001/api/v1/otp/forgot-password', {
          email: formData.email,
        });
        console.log('data otp', otp);
        setStep(2);
      } else {
        // --- RESET FINAL (STEP 2) - TON JSON ---
        const payload = {
          email: formData.email,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
          code: otp.join(''),
        };
        if (newPassword !== confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            general: 'Les mots de passe ne correspondent pas',
          }));
          return;
        }
        await axios.post(
          'http://localhost:3001/api/v1/auth/reset-password',
          payload,
        );
        toast.success('Succès ! Connectez-vous avec votre nouveau mot de passe.');
        setIsForgotPassword(false);
        setStep(1);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setErrors((prev) => ({
          ...prev,
          general: 'Une erreur est survenue. Vérifiez vos informations.',
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans relative">
      {/* HEADER ACTIONS */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <ThemeToggle />
        <Link href="/frontend/page/event">
          <Button
            variant="outline"
            className="rounded-xl border-muted/20 font-bold"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Passer
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-surface rounded-[2.5rem] p-8 md:p-10 border border-muted/10 shadow-2xl">
          {/* HEADER CARD */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-title uppercase tracking-tighter font-title">
              {NAME}
            </h2>
            <h3 className="text-xl font-bold text-foreground mt-1">
              {!isForgotPassword
                ? 'Connexion'
                : step === 1
                  ? 'Mot de passe oublié'
                  : 'Nouveau mot de passe'}
            </h3>
            <p className="text-muted mt-2 text-sm font-medium">
              {!isForgotPassword
                ? 'Accédez à vos tickets et événements.'
                : step === 1
                  ? 'Entrez votre email pour recevoir le code.'
                  : 'Saisissez le code reçu et votre nouveau secret.'}
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-error/10 border-l-4 border-error rounded-r-xl animate-in fade-in zoom-in">
              <p className="text-xs text-error font-bold leading-tight">
                {errors.general}
              </p>
            </div>
          )}

          <div className="space-y-5">
            {/* INPUT EMAIL (Visible en Login et Step 1) */}
            {(!isForgotPassword || (isForgotPassword && step === 1)) && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted group-focus-within:text-brand transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-4 bg-background border-2 rounded-2xl focus:outline-none transition-all ${
                      errors.email
                        ? 'border-error'
                        : 'border-muted/10 focus:border-brand'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
            )}

            {/* INPUT PASSWORD (Login simple uniquement) */}
            {!isForgotPassword && (
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Mot de passe
                  </label>
                  <button
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] font-bold text-title hover:underline"
                  >
                    Oublié ?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted group-focus-within:text-brand transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-4 bg-background border-2 border-muted/10 rounded-2xl focus:border-brand focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            {/* STEP 2 : OTP + NEW PASSWORD (JSON Requirements) */}
            {isForgotPassword && step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* OTP INPUTS */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted block text-center">
                    Code de vérification
                  </label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        className="w-10 h-14 text-center text-xl font-bold bg-background border-2 border-muted/20 rounded-xl focus:border-brand focus:outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>
                {/* NEW PASSWORD FIELDS */}
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 py-4 bg-background border-2 border-muted/10 rounded-2xl focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 py-4 bg-background border-2 border-muted/10 rounded-2xl focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* SUBMIT BUTTON */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-btn hover:opacity-90 text-white font-title font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-sm">
                    {!isForgotPassword
                      ? 'Se connecter'
                      : step === 1
                        ? 'Envoyer le code'
                        : 'Mettre à jour'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </Button>

            {/* BACK BUTTON */}
            {isForgotPassword && (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setStep(1);
                }}
                className="w-full text-xs font-bold text-muted hover:text-foreground transition-colors"
              >
                Retour à la connexion
              </button>
            )}
          </div>
          {/* FOOTER CARD */}
          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted/10"></div>
            </div>
            <span className="relative bg-surface px-4 text-[10px] uppercase text-muted font-black tracking-[0.3em]">
              OU
            </span>
          </div>

          <Link href="/frontend/page/registers">
            <Button
              variant="outline"
              className="w-full py-4 border-2 border-muted/10 font-title font-bold rounded-2xl group"
            >
              <UserPlus className="w-5 h-5 mr-2 group-hover:text-title transition-colors" />
              CRÉER MON COMPTE
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
