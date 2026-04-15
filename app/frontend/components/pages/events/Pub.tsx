'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/Button';
import { PrizeRepository } from '@/app/frontend/module/prizes/infrastructure/prize.repositrory';

// Données statiques : title + description fixes
const STATIC_SLIDES = [
  {
    title: 'Je paye mon ticket en CASH',
    description: 'Participez à notre tombola exceptionnelle',
  },
  {
    title: "Aujourd'hui peut être ton jour de chance",
    description: 'Tentez votre chance et gagnez des prix incroyables',
  },
  {
    title: 'Des lots exceptionnels vous attendent',
    description: 'Réservez votre ticket et tentez de remporter de grands prix',
  },
] as const;
//  Type fusionné : statique + image dynamique
interface Slide {
  title: string;
  description: string;
  imageUrl: string; // vient de la BD
}

const prizeRepository = new PrizeRepository();
export default function ProfessionalAdBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  //  Fusion données statiques + images dynamiques
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const prizes = await prizeRepository.findPrizeRecent();

        const merged: Slide[] = prizes.map((prize, index) => ({
          // Données statiques (fallback sur le dernier si plus de slides que de prizes)
          title: STATIC_SLIDES[index % STATIC_SLIDES.length].title,
          description: STATIC_SLIDES[index % STATIC_SLIDES.length].description,
          // Image dynamique depuis la BD
          imageUrl: prize.imageUrl ?? '/images/default-prize.jpg',
        }));

        setSlides(merged);
      } catch (error) {
        console.error('Erreur lors de la récupération des prix :', error);
        // Fallback : slides statiques avec image par défaut si la BD échoue
        setSlides(
          STATIC_SLIDES.map((slide) => ({
            ...slide,
            imageUrl: '/images/default-prize.jpg',
          })),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  // ✅ Auto-play
  useEffect(() => {
    if (!slides.length || !isAutoPlaying || isHovered) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slides.length, isAutoPlaying, isHovered]);
  const goToNextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  const goToPreviousSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index: number) => setCurrentSlide(index);
  // Skeleton loader pendant le fetch
  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-2 sm:py-4 md:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-[480px] sm:h-[350px] md:h-[320px] lg:h-[350px] animate-pulse">
            <div className="flex flex-col md:flex-row items-center justify-center h-full gap-8 px-12 py-8">
              <div className="flex-1 space-y-4">
                <div className="h-10 bg-gray-200 rounded-xl w-3/4" />
                <div className="h-5 bg-gray-200 rounded-xl w-1/2" />
                <div className="h-12 bg-gray-200 rounded-xl w-40" />
              </div>
              <div className="w-64 h-64 bg-gray-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-2 sm:py-4 md:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6">
        <div
          className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Container des slides */}
          <div className="relative h-[480px] sm:h-[350px] md:h-[320px] lg:h-[350px] overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0 z-10'
                    : index < currentSlide
                      ? 'opacity-0 -translate-x-full z-0'
                      : 'opacity-0 translate-x-full z-0'
                }`}
              >
                <div className="flex flex-col md:flex-row items-center justify-center h-full gap-6 md:gap-8 lg:gap-12 px-6 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8">
                  {/* Contenu statique */}
                  <div className="flex-1 text-center md:text-left space-y-3 sm:space-y-4 md:space-y-6">
                    <h3 className="text-2xl text-title sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                      {slide.title}
                    </h3>
                    <p className="text-muted sm:text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                      {slide.description}
                    </p>
                    <Button size="lg">Participez maintenant</Button>
                  </div>

                  {/* Image dynamique depuis la BD */}
                  <div className="flex-shrink-0 relative">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
                      <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 border-4 border-white">
                        <Image
                          src={slide.imageUrl}
                          alt={slide.title}
                          fill
                          sizes="(max-width: 640px) 192px,
                                 (max-width: 768px) 224px,
                                 (max-width: 1024px) 256px,
                                 320px"
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Boutons navigation */}
          <button
            onClick={goToPreviousSlide}
            className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-xl transition-all transform hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 text-gray-700" />
          </button>
          <button
            onClick={goToNextSlide}
            className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-xl transition-all transform hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 text-gray-700" />
          </button>

          {/* Indicateurs */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentSlide
                    ? 'w-8 sm:w-10 h-2 sm:h-2.5 bg-gradient-to-r from-orange-500 to-red-600'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/60'
                }`}
              />
            ))}
          </div>
          {/* Compteur */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-black/50 backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>
    </div>
  );
}
