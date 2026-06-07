import React, { useState, useEffect } from 'react';
import { DollarSign, Trash2, Plus, RefreshCw, Layers, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface Court {
  id: number;
  name: string;
  hourlyRate: number;
  surface: string;
}

interface PriceRule {
  id: number;
  courtId: number;
  dayOfWeek: number; // 0-6
  startHour: string; // HH:MM
  endHour: string; // HH:MM
  rate: number;
}

export default function AdminPrices() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Default price edit state
  const [editingCourtId, setEditingCourtId] = useState<number | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(0);

  // Rule creation states
  const [targetCourtId, setTargetCourtId] = useState<number>(0);
  const [targetDay, setTargetDay] = useState<number>(1); // Monday default
  const [startHour, setStartHour] = useState('18:00');
  const [endHour, setEndHour] = useState('22:00');
  const [specialRate, setSpecialRate] = useState(900);

  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');

  const loadPricesData = async () => {
    setLoading(true);
    try {
      const courtsRes = await fetch('/api/courts');
      if (courtsRes.ok) {
        const courtsData = await courtsRes.json();
        setCourts(courtsData);
        if (courtsData.length > 0 && targetCourtId === 0) {
          setTargetCourtId(courtsData[0].id);
        }
      }

      const ratesRes = await fetch('/api/admin/prices');
      if (ratesRes.ok) {
        setPriceRules(await ratesRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricesData();
  }, []);

  const handleUpdateBaseRate = async (court: Court) => {
    if (editRateValue <= 0) return;
    try {
      const res = await fetch(`/api/courts/${court.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...court,
          hourlyRate: Number(editRateValue),
        }),
      });

      if (res.ok) {
        setCourts((prev) =>
          prev.map((c) => (c.id === court.id ? { ...c, hourlyRate: Number(editRateValue) } : c))
        );
        setEditingCourtId(null);
        setNotifSuccess(`✓ Tarifa base para [${court.name}] actualizada correctamente.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetCourtId === 0 || specialRate <= 0 || !startHour || !endHour) {
      setNotifError('Por favor introduce datos de reglas válidos.');
      return;
    }

    setNotifSuccess('');
    setNotifError('');

    try {
      const res = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: Number(targetCourtId),
          dayOfWeek: Number(targetDay),
          startHour,
          endHour,
          rate: Number(specialRate),
        }),
      });

      if (res.ok) {
        setNotifSuccess('⚡ ¡Regla de tarifa dinámica registrada en el sistema!');
        
        loadPricesData();
      } else {
        throw new Error('Falla en la respuesta al registrar regla de tarifa.');
      }
    } catch (err: any) {
      setNotifError(err.message || 'Contratiempo al registrar regla.');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta regla de tarifa dinámica?')) return;
    try {
      const res = await fetch(`/api/admin/prices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPriceRules((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCourtName = (courtId: number) => {
    return courts.find((c) => c.id === courtId)?.name || `Cancha #${courtId}`;
  };

  const getDayName = (dayNum: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNum] || `Día ${dayNum}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200 font-sans text-left" id="admin-prices-container">
      
      {/* 1. PEAK TIME RATES RULE CREATOR FORM */}
      <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl h-fit space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
            <Plus size={16} className="text-emerald-400" /> Tarifa Dinámica / Pico
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">Crea reglas de tarifas especiales para horas pico, fines de semana o nocturnas.</p>
        </div>

        <form onSubmit={handleCreateRule} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium">Asignar a Cancha *</label>
            <select
              value={targetCourtId}
              onChange={(e) => setTargetCourtId(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              required
            >
              <option value="" disabled>Selecciona cancha...</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium font-sans">Día de la Semana aplicable *</label>
            <select
              value={targetDay}
              onChange={(e) => setTargetDay(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              required
            >
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="0">Domingo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 block font-medium">Desde (HH:MM) *</label>
              <input
                type="text"
                placeholder="18:00"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-center font-mono font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 block font-medium">Hasta (HH:MM) *</label>
              <input
                type="text"
                placeholder="22:00"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-center font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium">Tarifa Especial ($ MXN por hora) *</label>
            <div className="relative">
              <input
                type="number"
                min={1}
                value={specialRate}
                onChange={(e) => setSpecialRate(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-8 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm font-bold"
                required
              />
              <DollarSign size={14} className="absolute left-3 top-3.5 text-zinc-500" />
            </div>
          </div>

          {notifSuccess && (
            <p className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-1 leading-normal">
              <CheckCircle size={12} className="shrink-0" /> {notifSuccess}
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
            Registrar Regla
          </button>
        </form>
      </div>

      {/* 2. BASE COURT RATES & PEAK LOGS RULES TABLE */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* BASE PRICE MANAGER LIST */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider">💵 Tarifas Base de Canchas</h2>
              <p className="text-[11px] text-zinc-500">Actualiza los costos base regulares de rentas por hora de tus jaulas.</p>
            </div>
            <button
              onClick={loadPricesData}
              className="rounded-full p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courts.map((court) => {
              const isEditing = editingCourtId === court.id;
              return (
                <div
                  key={court.id}
                  className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between shadow-lg"
                >
                  <div className="text-left space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white">{court.name}</h4>
                    <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-wide">
                      {court.surface}
                    </span>
                  </div>

                  <div className="text-right">
                    {isEditing ? (
                      <div className="flex gap-1 items-center">
                        <input
                          type="number"
                          value={editRateValue}
                          onChange={(e) => setEditRateValue(Number(e.target.value))}
                          className="w-20 bg-zinc-900 border border-zinc-800 font-mono font-bold text-xs p-1.5 focus:outline-none focus:border-emerald-500 text-white rounded-lg text-center"
                        />
                        <button
                          onClick={() => handleUpdateBaseRate(court)}
                          className="px-2.5 py-1.5 bg-emerald-500 text-black font-extrabold rounded-lg text-[10px] uppercase cursor-pointer"
                        >
                          Ok
                        </button>
                        <button
                          onClick={() => setEditingCourtId(null)}
                          className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg text-[10px] cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-zinc-500 font-medium">Tarifa Regular / H</span>
                        <div className="flex gap-2 items-center">
                          <strong className="text-emerald-400 font-extrabold font-mono text-sm">
                            ${court.hourlyRate.toLocaleString('es-MX')} MXN
                          </strong>
                          <button
                            onClick={() => {
                              setEditingCourtId(court.id);
                              setEditRateValue(court.hourlyRate);
                            }}
                            className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PEAK TIME RULE LOG TABLE */}
        <div className="space-y-4">
          <div className="border-b border-zinc-900 pb-3">
            <h2 className="text-base font-black text-white uppercase tracking-wider">⚡ Reglas de Tarifa Dinámica Activas</h2>
            <p className="text-[11px] text-zinc-500 font-sans">Listado de reglas de variación aplicadas en el checkout en tiempo de renta.</p>
          </div>

          {priceRules.length === 0 ? (
            <div className="py-12 bg-zinc-900/10 border border-zinc-900 rounded-2xl text-xs text-zinc-500 text-center font-sans leading-relaxed">
              No hay reglas activas por el momento. Las canchas cobrarán su tarifa regular para todos los horarios y días.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-900">
              <table className="min-w-full divide-y divide-zinc-900 text-xs">
                <thead className="bg-zinc-950 text-zinc-500 font-bold uppercase tracking-wider text-left text-[9px]">
                  <tr>
                    <th className="px-4 py-3">Cancha</th>
                    <th className="px-4 py-3">Día aplicable</th>
                    <th className="px-4 py-3">Horario</th>
                    <th className="px-4 py-3">Tarifa Especial</th>
                    <th className="px-4 py-3 text-center">Remover</th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-950/20 divide-y divide-zinc-900 text-zinc-300">
                  {priceRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-zinc-900/10 transition">
                      <td className="px-4 py-3 font-semibold text-white">{getCourtName(rule.courtId)}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">{getDayName(rule.dayOfWeek)}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{rule.startHour} - {rule.endHour} HS</td>
                      <td className="px-4 py-3 font-mono font-extrabold text-white">${rule.rate.toLocaleString('es-MX')} / H</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="rounded-full p-2 bg-rose-950/10 border border-rose-500/10 text-rose-450 hover:bg-rose-900 hover:text-white transition cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
