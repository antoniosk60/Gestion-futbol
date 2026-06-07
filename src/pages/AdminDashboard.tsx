import { useEffect, useState } from 'react';
import { DollarSign, Calendar, Landmark, Ticket, TrendingUp, AlertCircle, RefreshCw, Trophy, BellRing } from 'lucide-react';

interface Stats {
  totalEarnings: number;
  totalBookings: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  activeCourtsCount: number;
  activePromosCount: number;
  courtStats: { id: number; name: string; bookingCount: number; earnings: number }[];
  occupancyData: { day: string; reservations: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Error loading stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-zinc-500 font-mono">
        <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-emerald-500" />
        Generando tableros de estadísticas...
      </div>
    );
  }

  if (!stats) {
    return <p className="text-xs text-rose-450">Falla al sincronizar indicadores de administración.</p>;
  }

  // Find max reservation count for scaling the graph
  const maxDayBooking = Math.max(...stats.occupancyData.map((d) => d.reservations), 1);
  const maxCourtBooking = Math.max(...stats.courtStats.map((c) => c.bookingCount), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans text-left" id="admin-dashboard-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest flex items-center gap-1">
            <Landmark size={12} fill="currentColor" /> Sincronización Total
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-1">Estadísticas de Canchas</h1>
          <p className="text-xs sm:text-sm text-zinc-400"> Monitorea los ingresos generados por reservas, tasas de ocupación y desempeño de canchas. </p>
        </div>
        <button
          onClick={fetchStats}
          className="rounded-xl px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={12} /> Refrescar
        </button>
      </div>

      {/* KPI GRID CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">INGRESOS NETOS</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ${stats.totalEarnings.toLocaleString('es-MX')}
            </span>
            <span className="text-[10px] text-zinc-550 block font-mono">Pesos Mexicanos (MXN)</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
          <div className="space-y-1 text-xs">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">RESERVAS TOTALES</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{stats.totalBookings}</span>
            <div className="flex gap-2 text-[9px] font-mono mt-1 scale-95 origin-left">
              <span className="text-emerald-400">{stats.confirmedCount} listos</span>
              <span className="text-amber-400">{stats.pendingCount} pend.</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Calendar size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">CANCHAS OPERATIVAS</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{stats.activeCourtsCount} / {stats.courtStats.length}</span>
            <span className="text-[10px] text-zinc-550 block">Cortes de pasto monofilamento</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Trophy size={20} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">CUPONES VIGENTES</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{stats.activePromosCount}</span>
            <span className="text-[10px] text-zinc-550 block font-mono">Campañas de mercadotecnia</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-450 flex items-center justify-center">
            <Ticket size={20} />
          </div>
        </div>

      </div>

      {/* SVG GRAPHICS PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRAPH 1: OCCUPANCY BY WEEKDAY */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-zinc-900 pb-3 text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">🗓️ Reservas por Día de la Semana</h3>
            <p className="text-[10px] text-zinc-500">Muestra la afluencia de partidos pactados de Lunes a Domingo.</p>
          </div>

          <div className="space-y-4 pt-2">
            {stats.occupancyData.map((d, index) => {
              // Calculate width percentage based on maxDayBooking to scale perfectly
              const pct = (d.reservations / maxDayBooking) * 100;
              return (
                <div key={index} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-zinc-350">{d.day}</span>
                    <span className="font-mono font-bold text-emerald-400">{d.reservations} {d.reservations === 1 ? 'partido' : 'partidos'}</span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800/40">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-emerald-500 rounded-full h-full transition-all duration-1000 ease-out"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRAPH 2: STATISTICS PER COURT */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-zinc-900 pb-3 text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">🏟️ Desempeño por Cancha de Juego</h3>
            <p className="text-[10px] text-zinc-500">Total de reservas recaudadas y dinero facturado por cada una.</p>
          </div>

          <div className="divide-y divide-zinc-900">
            {stats.courtStats.map((c, index) => {
              const pct = (c.bookingCount / maxCourtBooking) * 100;
              return (
                <div key={index} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-left space-y-1 flex-1">
                    <span className="text-xs font-extrabold text-white">{c.name}</span>
                    <div className="flex gap-2 items-center text-[10px] font-mono text-zinc-500">
                      <span>{c.bookingCount} reservas registradas</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">${c.earnings.toLocaleString('es-MX')} MXN</span>
                    </div>

                    {/* Simple bar visual overlay */}
                    <div className="w-2/3 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800/20 mt-1 max-w-xs">
                      <div
                        style={{ width: `${pct}%` }}
                        className="bg-emerald-500/60 rounded-full h-full"
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-850 px-3 py-2 rounded-xl text-right font-mono text-xs text-zinc-350 shrink-0 self-start md:self-auto">
                    <span className="text-[9px] uppercase tracking-wider block text-zinc-500">Facturado</span>
                    <strong className="text-emerald-400 font-extrabold text-sm">${c.earnings.toLocaleString('es-MX')}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ADMIN TICK HOOK INFO CARD */}
      <div className="bg-zinc-950 border border-emerald-500/10 rounded-2xl p-5 flex gap-3 text-left shadow-lg">
        <BellRing className="text-emerald-500 shrink-0 mt-0.5" size={18} />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-white">🔔 Notificaciones Automáticas del Servidor</span>
          <p className="text-zinc-400 leading-relaxed font-sans">
            El sistema de recordatorios está activo y corriendo una rutina automatizada cada 30 minutos. Notificará automáticamente a los clientes un recordatorio al Centro de Alertas y registrará alertas para todos los partidos que falten entre 24 y 24.5 horas para dar inicio.
          </p>
        </div>
      </div>
    </div>
  );
}
