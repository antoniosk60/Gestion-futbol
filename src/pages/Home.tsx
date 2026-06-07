import { useEffect, useState } from 'react';
import { Trophy, CalendarCheck, Sparkles, Star, Users, Flame, ChevronRight, Heart } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function Home({ onNavigate }: HomePageProps) {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    // Fetch approved customer reviews
    const loadReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          setReviewsList(data);
        }
      } catch (e) {
        console.error('Error loading reviews:', e);
      }
    };
    loadReviews();
  }, []);

  const features = [
    {
      icon: <Trophy className="text-amber-400 h-6 w-6 shrink-0" />,
      title: "Pasto Sintético Certificado",
      desc: "Superficie de última generación, amortiguación contra lesiones e impecable drenaje."
    },
    {
      icon: <Flame className="text-emerald-400 h-6 w-6 shrink-0" />,
      title: "Iluminación Profesional LED",
      desc: "Nivel óptimo de iluminación blanca para que juegues de noche con visibilidad perfecta de portería a portería."
    },
    {
      icon: <Users className="text-blue-400 h-6 w-6 shrink-0" />,
      title: "Instalaciones de Confort",
      desc: "Amplio estacionamiento vigilado, vestidores higiénicos, regaderas y cafetería con terraza."
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-300 font-sans" id="home-page-container">
      {/* 1. ATHLETIC HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-900 shadow-2xl p-6 sm:p-12 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 min-h-[480px]">
        {/* Subtle glowing radial background */}
        <div className="absolute inset-0 bg-radial-at-t from-emerald-950/20 via-transparent to-transparent opacity-60" />
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex-1 space-y-6 text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="animate-pulse" /> Siente la Pasión del Gol
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            La Mejor Cancha de <span className="text-emerald-500">Fútbol Rápido</span> en la Ciudad
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Te ofrecemos instalaciones profesionales de primer nivel, domos techados contra intemperies, sistema de reservas online 100% automatizado con facturación instantánea y torneos competitivos semanales.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('reservas')}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 hover:scale-105 active:scale-95 duration-200 transition text-black font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck size={16} /> Agendar tu Cancha
            </button>
            <button
              onClick={() => onNavigate('promotions')}
              className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 duration-200 transition text-white font-semibold text-xs tracking-wider uppercase cursor-pointer"
            >
              Ofertas de la Semana
            </button>
          </div>
        </div>

        {/* Dynamic Image Collage Hero */}
        <div className="relative flex-1 w-full max-w-md md:max-w-none aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop"
            alt="Futbol Rapido"
            className="h-full w-full object-cover filter brightness-90 hover:scale-105 transition-all duration-700"
          />
          {/* Neon corner bracket highlights */}
          <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-emerald-500/70" />
          <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-emerald-500/70" />
          
          <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/90 border border-zinc-800 backdrop-blur px-4 py-3 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-white">Domos Techados Listos</span>
            </div>
            <span className="text-zinc-500 font-mono">Disponibles hasta 11:00 PM</span>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPS / FEATURES */}
      <section className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">⚽ Nuestras Fortalezas</h2>
          <p className="text-xs sm:text-sm text-zinc-400">Instalaciones de alto rendimiento deportivo hechas para apasionados del fútbol.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-left hover:border-emerald-500/30 transition-all duration-300 shadow-lg space-y-3"
            >
              <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">{feat.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. REVIEWS SECTIONS CAROUSEL */}
      <section className="bg-zinc-950/40 rounded-3xl border border-zinc-900 p-6 sm:p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full" />
        
        <div className="space-y-4 max-w-lg mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Star size={12} className="fill-current" /> Comunidad Goleadora
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">¿Qué dicen de nosotros?</h2>
          
          {reviewsList.length === 0 ? (
            <p className="text-xs text-zinc-500 py-8 italic">Cargando comentarios de nuestros clientes...</p>
          ) : (
            <div className="space-y-4 pt-4 animate-in fade-in duration-350 min-h-[140px]">
              <div className="flex justify-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < reviewsList[activeReviewIndex].rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base text-zinc-200 italic font-medium leading-relaxed font-sans">
                "{reviewsList[activeReviewIndex].comment}"
              </p>
              <div>
                <p className="text-xs font-bold text-emerald-400 tracking-wider">
                  {reviewsList[activeReviewIndex].authorName}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Cliente Verificado • {reviewsList[activeReviewIndex].date}</p>
              </div>

              {/* Dot selectors */}
              {reviewsList.length > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {reviewsList.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveReviewIndex(index)}
                      className={`h-2 transition-all rounded-full ${
                        index === activeReviewIndex ? 'w-6 bg-emerald-500' : 'w-2 bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. FOOTER AD / CTA */}
      <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-left space-y-2 max-w-lg">
          <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider">🗓️ ¿Y para hoy qué hay?</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Arma el reta con tus amigos del trabajo o del barrio hoy. Selecciona día, cancha disponible, liquida tu reserva con tarjeta y recibe confirmación instantánea por WhatsApp.
          </p>
        </div>
        <button
          onClick={() => onNavigate('reservas')}
          className="px-6 py-3.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase transition hover:bg-emerald-400 hover:scale-105 active:scale-95 duration-200 cursor-pointer flex items-center gap-1 shrink-0"
        >
          Apartar Cancha Ahora <ChevronRight size={14} />
        </button>
      </section>
    </div>
  );
}
