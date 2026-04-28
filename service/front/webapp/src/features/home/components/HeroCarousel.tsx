import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CarouselSlide {
  id: string;
  titre?: string;
  description?: string;
  image?: string;
  lien?: string;
}

const SLIDES: CarouselSlide[] = [
  {
    id: '1',
    titre: 'Protection SOC 24/7',
    description: 'Surveillez votre infrastructure en temps réel avec nos experts en cybersécurité.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80',
    lien: '/catalog?categorie=SOC',
  },
  {
    id: '2',
    titre: 'Solutions EDR avancées',
    description: 'Détectez et répondez aux menaces sur vos endpoints avant qu\'elles causent des dégâts.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1920&q=80',
    lien: '/catalog?categorie=EDR',
  },
  {
    id: '3',
    titre: 'XDR — Vision globale',
    description: 'Unifiez la détection sur tous vos vecteurs d\'attaque avec notre plateforme XDR.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1920&q=80',
    lien: '/catalog?categorie=XDR',
  },
];

const GRADIENT_BACKGROUNDS = [
  'from-blue-900 to-indigo-900',
  'from-purple-900 to-blue-900',
  'from-indigo-900 to-cyan-900',
];

export default function HeroCarousel() {
  const slides = SLIDES;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(i => (i + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent(i => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div className="relative h-[520px] overflow-hidden bg-gray-900">
      {slide.image ? (
        <img
          src={slide.image}
          alt={slide.titre ?? 'Slide'}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_BACKGROUNDS[current % GRADIENT_BACKGROUNDS.length]}`}
        />
      )}

      <div className="relative z-10 flex h-full items-center justify-center px-8 text-center text-white">
        <div className="max-w-3xl">
          {slide.titre && (
            <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              {slide.titre}
            </h1>
          )}
          {slide.description && (
            <p className="mb-8 text-lg text-gray-200 sm:text-xl">{slide.description}</p>
          )}
          <Link
            to={slide.lien ?? '/catalog'}
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-500"
          >
            Découvrir nos solutions
          </Link>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Diapositive précédente"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        aria-label="Diapositive suivante"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_slide: CarouselSlide, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Aller à la diapositive ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === current ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
