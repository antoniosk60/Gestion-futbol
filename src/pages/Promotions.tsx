import { useEffect, useState } from 'react';
import { Copy, Check, Ticket, Sparkles, TrendingDown, Clock, Search } from 'lucide-react';

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  active: number;
}

export default function Promotions() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const res = await fetch('/api/promotions');
        if (res.ok) {
          const data = await res.json();
          // Filter only active promos for public view
          setPromos(data.filter((p: Promotion) => p.active === 1));
        }
      } catch (err) {
        console.error('Error loading promos:', err);
      }
    };
    loadPromos();
  }, []);

  const handleCopyCode = (promo: Promotion) => {
    navigator.clipboard.writeText(promo.code);
    setCopiedId(promo.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filtered = promos.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans" id="promotions-page-container">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="text-left space-y-1">
          <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest flex items-center gap-1">
            <Ticket size={12} /> Cupones Club
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">Promociones Activas</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Copia nuestros códigos vigentes y aplícalos directamente al agendar tu cancha para ahorrar.</p>
        </div>
        
        {/* Simple search bar */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar código o descuento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-900 focus:outline-none focus:border-emerald-500 text-xs text-white"
          />
        </div>
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950 rounded-2xl border border-zinc-900 space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600">
            <Ticket size={24} />
          </div>
          <p className="text-sm text-zinc-400">Por el momento no hay promociones activas registradas. ¡Vuelve pronto!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950 rounded-2xl border border-zinc-900">
          <p className="text-sm text-zinc-400">Ningún código coincide con tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((promo) => (
            <div
              key={promo.id}
              className="group bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl hover:border-emerald-500/20 transition-all duration-300 flex flex-col relative text-left"
              id={`promotion-card-${promo.id}`}
            >
              <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1">
                <Sparkles size={10} className="fill-current" />
                {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `-$${promo.discountValue} MXN`}
              </div>

              {/* Photo Header */}
              <div className="h-44 overflow-hidden relative">
                <img
                  src={promo.imageUrl || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=400&fit=crop'}
                  alt={promo.title}
                  className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-emerald-400 transition">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">{promo.description}</p>
                </div>

                <div className="space-y-4 pt-2 border-t border-zinc-900/80">
                  {/* Validity Info */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <Clock size={12} className="text-zinc-600" />
                    <span>Lanzamiento: {promo.startDate}</span>
                    <span>•</span>
                    <span>Vence: {promo.endDate}</span>
                  </div>

                  {/* Interactive Copier badge */}
                  <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">CÓDIGO DE CUPÓN</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono tracking-wider">{promo.code}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(promo)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-sans cursor-pointer transition ${
                        copiedId === promo.id
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700/60'
                      }`}
                    >
                      {copiedId === promo.id ? (
                        <>
                          <Check size={12} /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
