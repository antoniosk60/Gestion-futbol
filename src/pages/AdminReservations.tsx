import { useEffect, useState } from 'react';
import { Calendar, Trash2, CheckCircle2, XCircle, Search, RefreshCw, Phone, Mail, Clock } from 'lucide-react';

interface Reservation {
  id: number;
  courtId: number;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
}

interface Court {
  id: number;
  name: string;
}

export default function AdminReservations() {
  const [reservationsList, setReservationsList] = useState<Reservation[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'todos' | 'pending' | 'confirmed' | 'cancelled'>('todos');

  const loadData = async () => {
    setLoading(true);
    try {
      const courtsRes = await fetch('/api/courts');
      if (courtsRes.ok) {
        const courtsData = await courtsRes.json();
        setCourts(courtsData);
      }

      const res = await fetch('/api/reservations');
      if (res.ok) {
        const resData = await res.json();
        // Sort descending by created or reservation date
        resData.sort((a: Reservation, b: Reservation) => {
          return b.id - a.id;
        });
        setReservationsList(resData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'pending' | 'confirmed' | 'cancelled', paymentStatus: 'unpaid' | 'paid') => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus }),
      });

      if (res.ok) {
        setReservationsList((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, paymentStatus } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCourtName = (courtId: number) => {
    return courts.find((c) => c.id === courtId)?.name || `Cancha #${courtId}`;
  };

  const filtered = reservationsList.filter((res) => {
    const matchesSearch =
      res.clientName.toLowerCase().includes(search.toLowerCase()) ||
      res.clientPhone.includes(search) ||
      res.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      getCourtName(res.courtId).toLowerCase().includes(search.toLowerCase()) ||
      res.id.toString() === search;

    const matchesStatus = selectedStatus === 'todos' || res.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-left" id="admin-reservations-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">Bitácora de Reservas</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Revisa la lista completa de apartados, aprueba solicitudes pendientes o cancela turnos.</p>
        </div>
        <button
          onClick={loadData}
          className="rounded-xl px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={12} /> Refrescar Lista
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, cel, correo, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-900 focus:outline-none focus:border-emerald-500 text-xs text-white"
          />
        </div>

        {/* Status Select */}
        <div className="flex gap-2">
          {([
            { value: 'todos', label: 'Todos' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'confirmed', label: 'Confirmados' },
            { value: 'cancelled', label: 'Cancelados' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                selectedStatus === opt.value
                  ? 'bg-emerald-500 text-black border-emerald-400/20 font-bold'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white hover:border-zinc-850'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-500 font-mono">
          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-500" />
          Actualizando bitácora de reservaciones...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950 rounded-2xl border border-zinc-900 text-xs text-zinc-500">
          Ninguna reserva registrada coincide con tu criterio de filtros.
        </div>
      ) : (
        /* RESPONSIVE TABLE */
        <div className="overflow-x-auto rounded-2xl border border-zinc-900">
          <table className="min-w-full divide-y divide-zinc-900 text-xs">
            <thead className="bg-zinc-950 font-bold tracking-wider text-zinc-400 text-left uppercase text-[10px]">
              <tr>
                <th className="px-5 py-4">ID / Folio</th>
                <th className="px-5 py-4">Cancha</th>
                <th className="px-5 py-4">Fecha y Hora</th>
                <th className="px-5 py-4">Capitán / Contacto</th>
                <th className="px-5 py-4">Monto Cobrado</th>
                <th className="px-5 py-4">Estados</th>
                <th className="px-5 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-950/30 divide-y divide-zinc-900" id="admin-reservations-table-body">
              {filtered.map((res) => {
                return (
                  <tr key={res.id} className="hover:bg-zinc-900/40 transition">
                    {/* ID */}
                    <td className="px-5 py-4 font-mono font-bold text-zinc-300">
                      #{res.id}
                    </td>

                    {/* Court */}
                    <td className="px-5 py-4 font-semibold text-white">
                      {getCourtName(res.courtId)}
                    </td>

                    {/* Date/Time */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-zinc-200">{res.date}</span>
                        <span className="font-mono text-emerald-400 tracking-wide">{res.startTime} - {res.endTime} HS</span>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-zinc-305 gap-0.5">
                        <span className="font-bold text-white font-sans">{res.clientName}</span>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono"><Phone size={10} /> {res.clientPhone}</span>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono"><Mail size={10} /> {res.clientEmail}</span>
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                      ${res.totalPrice.toLocaleString('es-MX')}
                    </td>

                    {/* Status badges */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {/* Booking badge status */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          res.status === 'confirmed'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : res.status === 'pending'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                        }`}>
                          {res.status === 'confirmed' ? 'Confirmado' : res.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                        </span>

                        {/* Payment badge status */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          res.paymentStatus === 'paid'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : 'bg-zinc-800 border-zinc-700/60 text-zinc-500'
                        }`}>
                          {res.paymentStatus === 'paid' ? 'Pagado' : 'Impago'}
                        </span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {res.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(res.id, 'confirmed', 'paid')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition uppercase flex items-center gap-1"
                            title="Confirmar Partido y Pago"
                          >
                            <CheckCircle2 size={11} /> Confirmar
                          </button>
                        )}
                        {res.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(res.id, 'cancelled', 'unpaid')}
                            className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/10 text-rose-400 font-semibold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition uppercase flex items-center gap-1"
                            title="Cancelar Partido"
                          >
                            <XCircle size={11} /> Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
