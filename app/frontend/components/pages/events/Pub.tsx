'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/Button';
import { PrizeRepository } from '@/app/frontend/module/prizes/infrastructure/prize.repositrory';
import Link from 'next/link';

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

interface Slide {
  title: string;
  description: string;
  imageUrl: string;
}

const prizeRepository = new PrizeRepository();

export default function ProfessionalAdBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const [countAnimKey, setCountAnimKey] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const prizes = await prizeRepository.findPrizeRecent();
        const merged: Slide[] = prizes.map((prize, index) => ({
          title: STATIC_SLIDES[index % STATIC_SLIDES.length].title,
          description: STATIC_SLIDES[index % STATIC_SLIDES.length].description,
          imageUrl: prize.imageUrl ?? '/images/default-prize.jpg',
        }));
        setSlides(merged);
      } catch (error) {
        console.error('Erreur lors de la récupération des prix :', error);
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

  useEffect(() => {
    if (!slides.length || !isAutoPlaying || isHovered) return;
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slides.length, isAutoPlaying, isHovered, currentSlide]);

  const handleNext = () => {
    setPrevSlide(currentSlide);
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgressKey((k) => k + 1);
    setCountAnimKey((k) => k + 1);
  };

  const handlePrev = () => {
    setPrevSlide(currentSlide);
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgressKey((k) => k + 1);
    setCountAnimKey((k) => k + 1);
  };

  const goToSlide = (index: number) => {
    if (index === currentSlide) return;
    setPrevSlide(currentSlide);
    setDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
    setProgressKey((k) => k + 1);
    setCountAnimKey((k) => k + 1);
  };

  const getSlideState = (index: number) => {
    if (index === currentSlide) return 'active';
    if (index === prevSlide) return 'exiting';
    return 'hidden';
  };

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
    <>
      <style>{`
        @keyframes bannerProgressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes bannerSlideInRight {
          from { opacity: 0; transform: translateX(48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bannerSlideInLeft {
          from { opacity: 0; transform: translateX(-48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bannerSlideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-48px); }
        }
        @keyframes bannerSlideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(48px); }
        }
        @keyframes bannerTitleIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bannerDescIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bannerCtaIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bannerBadgeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bannerKenBurns {
          0%   { transform: scale(1.08) translate(0px, 0px); }
          50%  { transform: scale(1.08) translate(-7px, -4px); }
          100% { transform: scale(1.08) translate(0px, 0px); }
        }
        @keyframes bannerCountSpin {
          0%   { opacity: 1; transform: translateY(0); }
          35%  { opacity: 0; transform: translateY(-8px); }
          65%  { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bannerShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes bannerFloat {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          100% { transform: translateY(-130px) rotate(200deg); opacity: 0; }
        }
        @keyframes bannerDotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.45); }
          50%       { box-shadow: 0 0 0 5px rgba(234,88,12,0); }
        }

        .banner-slide-active-next {
          animation: bannerSlideInRight 0.6s cubic-bezier(.22,.68,0,1.15) forwards;
        }
        .banner-slide-active-prev {
          animation: bannerSlideInLeft 0.6s cubic-bezier(.22,.68,0,1.15) forwards;
        }
        .banner-slide-exit-next {
          animation: bannerSlideOutLeft 0.5s ease forwards;
        }
        .banner-slide-exit-prev {
          animation: bannerSlideOutRight 0.5s ease forwards;
        }
        .banner-title-anim  { animation: bannerTitleIn  0.55s 0.05s cubic-bezier(.22,.68,0,1.2) both; }
        .banner-desc-anim   { animation: bannerDescIn   0.55s 0.15s cubic-bezier(.22,.68,0,1.2) both; }
        .banner-cta-anim    { animation: bannerCtaIn    0.55s 0.26s cubic-bezier(.22,.68,0,1.2) both; }
        .banner-badge-anim  { animation: bannerBadgeIn  0.45s 0.0s  cubic-bezier(.22,.68,0,1.2) both; }
        .banner-ken-burns   { animation: bannerKenBurns 10s ease-in-out infinite; }
        .banner-count-spin  { animation: bannerCountSpin 0.45s ease both; }
        .banner-shimmer-btn {
          background: linear-gradient(90deg, #ea580c 0%, #ef4444 38%, #f97316 62%, #ea580c 100%);
          background-size: 200% auto;
          animation: bannerShimmer 2.8s linear infinite;
        }
        .banner-progress {
          height: 3px;
          animation: bannerProgressFill 5s linear forwards;
          background: linear-gradient(90deg, #ea580c, #ef4444);
          border-radius: 2px;
        }
        .banner-dot-active {
          animation: bannerDotPulse 1.8s ease infinite;
        }
        .banner-particle {
          animation: bannerFloat linear infinite;
        }
      `}</style>

      <div className="w-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-2 sm:py-4 md:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6">
          <div
            className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              boxShadow:
                '0 8px 40px rgba(0,0,0,0.10), 0 1.5px 4px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* ── Progress bar ── */}
            <div
              className="absolute top-0 left-0 right-0 z-30"
              style={{ height: '3px', background: 'rgba(0,0,0,0.06)' }}
            >
              <div
                key={progressKey}
                className="banner-progress"
                style={{ width: 0 }}
              />
            </div>

            {/* ── Particules flottantes ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="banner-particle absolute rounded-full"
                  style={{
                    width: `${4 + ((i * 1.7) % 6)}px`,
                    height: `${4 + ((i * 1.7) % 6)}px`,
                    background: 'rgba(234,88,12,0.3)',
                    left: `${(i * 9 + 5) % 90}%`,
                    bottom: '-12px',
                    animationDuration: `${6 + ((i * 1.3) % 6)}s`,
                    animationDelay: `${(i * 0.7) % 6}s`,
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>

            {/* ── Slides container ── */}
            <div className="relative h-[480px] sm:h-[350px] md:h-[320px] lg:h-[350px] overflow-hidden">
              {slides.map((slide, index) => {
                const state = getSlideState(index);
                if (state === 'hidden') return null;

                const activeClass =
                  state === 'active'
                    ? direction === 'next'
                      ? 'banner-slide-active-next'
                      : 'banner-slide-active-prev'
                    : direction === 'next'
                      ? 'banner-slide-exit-next'
                      : 'banner-slide-exit-prev';

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 ${activeClass}`}
                    style={{ zIndex: state === 'active' ? 10 : 5 }}
                  >
                    <div className="flex flex-col md:flex-row items-center h-full">
                      {/* ── Contenu texte ── */}
                      <div
                        className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center px-6 sm:px-8 md:px-10 lg:px-14 py-4 md:py-8 bg-white"
                        style={{
                          borderRight: '3px solid rgba(234,88,12,0.15)',
                          borderRadius: '0 40px 40px 0',
                        }}
                      >
                        <div
                          className="text-center md:text-left w-full"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                          }}
                        >
                          {/* Badge catégorie */}
                          <div className="banner-badge-anim flex items-center gap-2 justify-center md:justify-start">
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#ea580c',
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#ea580c',
                              }}
                            >
                              Tombola
                            </span>
                          </div>

                          {/* Titre */}
                          <h3
                            className="banner-title-anim text-title"
                            style={{
                              fontSize: 'clamp(20px, 3.5vw, 40px)',
                              fontWeight: 800,
                              lineHeight: 1.2,
                              margin: 0,
                            }}
                          >
                            {slide.title}
                          </h3>

                          {/* Description */}
                          <p
                            className="banner-desc-anim text-muted"
                            style={{
                              fontSize: 'clamp(13px, 1.5vw, 17px)',
                              lineHeight: 1.65,
                              margin: 0,
                              maxWidth: '380px',
                            }}
                          >
                            {slide.description}
                          </p>

                          {/* CTA */}
                          <div className="banner-cta-anim">
                            <Link href={`/#event`}>
                              <Button
                                size="lg"
                                className="banner-shimmer-btn"
                                style={{
                                  border: 'none',
                                  color: '#fff',
                                  borderRadius: '50px',
                                  fontWeight: 700,
                                  letterSpacing: '0.01em',
                                  padding: '13px 30px',
                                  cursor: 'pointer',
                                  transition: 'filter 0.2s, transform 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.filter = 'brightness(1.1)';
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.transform = 'scale(1.04)';
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.filter = 'brightness(1)';
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.transform = 'scale(1)';
                                }}
                              >
                                Je prends mon ticket →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* ── Image avec Ken Burns ── */}
                      <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
                        <div className="banner-ken-burns absolute inset-0">
                          <Image
                            src={slide.imageUrl}
                            alt={slide.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                            priority={index === 0}
                          />
                        </div>
                        {/* Overlay gradient subtil */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(234,88,12,0.08) 0%, transparent 60%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Bouton précédent ── */}
            <button
              onClick={handlePrev}
              className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center"
              style={{
                width: 46,
                height: 46,
                background: 'rgba(255,255,255,0.92)',
                border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: '50%',
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                cursor: 'pointer',
                transition: 'transform 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  'translateY(-50%) scale(1.12)';
                (e.currentTarget as HTMLElement).style.background = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  'translateY(-50%) scale(1)';
                (e.currentTarget as HTMLElement).style.background =
                  'rgba(255,255,255,0.92)';
              }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* ── Bouton suivant ── */}
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center"
              style={{
                width: 46,
                height: 46,
                background: 'rgba(255,255,255,0.92)',
                border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: '50%',
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                cursor: 'pointer',
                transition: 'transform 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  'translateY(-50%) scale(1.12)';
                (e.currentTarget as HTMLElement).style.background = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  'translateY(-50%) scale(1)';
                (e.currentTarget as HTMLElement).style.background =
                  'rgba(255,255,255,0.92)';
              }}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            {/* ── Indicateurs ── */}
            <div
              className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center"
              style={{ gap: '8px' }}
            >
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={index === currentSlide ? 'banner-dot-active' : ''}
                  style={{
                    width: index === currentSlide ? '28px' : '8px',
                    height: '8px',
                    borderRadius: index === currentSlide ? '4px' : '50%',
                    background:
                      index === currentSlide
                        ? 'linear-gradient(90deg,#ea580c,#ef4444)'
                        : 'rgba(255,255,255,0.55)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition:
                      'width 0.35s cubic-bezier(.4,0,.2,1), border-radius 0.35s, background 0.35s',
                  }}
                />
              ))}
            </div>

            {/* ── Compteur animé ── */}
            <div
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20"
              style={{
                background: 'rgba(0,0,0,0.48)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 13px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span
                key={countAnimKey}
                className="banner-count-spin"
                style={{ display: 'inline-block' }}
              >
                {currentSlide + 1}
              </span>
              <span style={{ opacity: 0.5 }}> / </span>
              <span>{slides.length}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
