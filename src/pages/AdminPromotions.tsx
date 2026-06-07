import React, { useState, useEffect } from 'react';
import { Tag, Trash2, Plus, RefreshCw, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  active: number; // 1 = true, 0 = false
}

export default function AdminPromotions() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [code, setCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');

  const loadPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setEndDate(nextMonth.toISOString().split('T')[0]);
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !code.trim() || !startDate || !endDate) {
      setNotifError('Por favor, llena todos los campos obligatorios del cupón.');
      return;
    }

    setNotifSuccess('');
    setNotifError('');

    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          discountType,
          discountValue: Number(discountValue),
          code,
          startDate,
          endDate,
          imageUrl: imageUrl || undefined,
        }),
      });

      if (res.ok) {
        setNotifSuccess(`🎈 ¡Promoción [${code.toUpperCase()}] creada con éxito!`);
        setTitle('');
        setDescription('');
        setCode('');
        setImageUrl('');
        setDiscountValue(10);
        
        loadPromos();
      } else {
        throw new Error('Falla en la respuesta al registrar promoción en base de datos.');
      }
    } catch (err: any) {
      setNotifError(err.message || 'Contratiempo al registrar cupón.');
    }
  };

  const handleTogglePromoActive = async (id: number, current: Promotion) => {
    const nextState = current.active === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...current,
          active: nextState,
        }),
      });

      if (res.ok) {
        setPromos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, active: nextState } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePromo = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta promoción?')) return;
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200 font-sans text-left" id="admin-promotions-container">
      
      {/* 1. CREATION FORM SIDEBAR */}
      <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl h-fit space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
            <Plus size={16} className="text-emerald-400" /> Crear Promoción / Cupón
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">Crea cupones de descuento válidos para la taquilla del club.</p>
        </div>

        <form onSubmit={handleCreatePromo} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium">Nombre de Promoción *</label>
            <input
              type="text"
              placeholder="Ej: Lunes de Goleada Loca"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 block font-medium">Código Cupón *</label>
              <input
                type="text"
                placeholder="LUNES20"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-emerald-500 font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 block font-medium">Tipo Descuento *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-zinc-305"
                required
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Fijo ($ MXN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 block font-medium">Valor Descuento *</label>
              <input
                type="number"
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-emerald-500 text-sm font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 block font-medium">URL de Imagen Decorativa</label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="space-y-1 font-sans">
              <label className="text-zinc-400 block font-medium">Vence desde *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none text-xs"
                required
              />
            </div>
            <div className="space-y-1 font-sans">
              <label className="text-zinc-400 block font-medium">Expira en *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium">Descripción Narrativa *</label>
            <textarea
              rows={3}
              placeholder="Ej: Descuento aplicable en reservas matutinas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-sans"
              required
            />
          </div>

          {notifSuccess && (
            <p className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-1">
              <CheckCircle size={12} /> {notifSuccess}
            </p>
          )}

          {notifError && (
            <p className="text-[10px] text-rose-450 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl flex items-center gap-1">
              <AlertTriangle size={12} className="shrink-0" /> {notifError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
          >
            Crear Promoción
          </button>
        </form>
      </div>

      {/* 2. PROMOTIONS LISTING COLUMN */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider">🏷️ Cupones en Sistema</h2>
            <p className="text-[11px] text-zinc-500">Activa, desactiva o remueve códigos para la taquilla.</p>
          </div>
          <button
            onClick={loadPromos}
            className="rounded-full p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Refrescar promociones"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-zinc-500 font-mono text-center py-12">Sincronizando promociones...</p>
        ) : promos.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl text-sm text-zinc-505">
            Aún no hay códigos de cupones creados en el deportivo.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 flex flex-col justify-between text-left shadow-lg gap-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-extrabold text-emerald-400 text-sm tracking-wider uppercase bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-xl leading-none">
                      {promo.code}
                    </span>
                    
                    {/* Active toggle button status */}
                    <button
                      onClick={() => handleTogglePromoActive(promo.id, promo)}
                      className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wide border cursor-pointer transition ${
                        promo.active === 1
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {promo.active === 0 ? 'Desactivado' : 'Activo'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{promo.title}</h4>
                    <p className="text-[11px] text-zinc-405 leading-relaxed font-sans line-clamp-2">{promo.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900/80 pt-3 text-[10px] text-zinc-500 font-mono">
                  <div className="flex flex-col">
                    <span>Descuento: {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue} MXN`}</span>
                    <span>Vence: {promo.endDate}</span>
                  </div>
                  <button
                    onClick={() => handleDeletePromo(promo.id)}
                    className="rounded-full p-2 bg-rose-950/20 border border-rose-500/10 text-rose-400 hover:bg-rose-900 hover:text-white transition cursor-pointer"
                    title="Eliminar promoción"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
