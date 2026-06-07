import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronRight, CheckCircle2, Ticket, Sparkles, LayoutGrid, Info, ArrowLeft } from 'lucide-react';
import PaymentForm from '../components/PaymentForm.tsx';

interface Court {
  id: number;
  name: string;
  description: string;
  surface: string;
  capacity: string;
  hourlyRate: number;
  imageUrl: string;
  active: number;
}

interface SelectedTimeSlot {
  start: string;
  end: string;
}

export default function Reservations() {
  const [courtsList, setCourtsList] = useState<Court[]>([]);
  const [step, setStep] = useState(1); // Steps: 1 (Court), 2 (Date/Time), 3 (Details), 4 (Payment)
  
  // Selections
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<SelectedTimeSlot | null>(null);
  
  // Availability Cache
  const [takenSlots, setTakenSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  
  // Client forms
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  // Promo codes
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [activePromo, setActivePromo] = useState<any | null>(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');

  // Calculations
  const [basePrice, setBasePrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  // Completed reservation holder
  const [newReservation, setNewReservation] = useState<any | null>(null);

  // Time Slots catalog (Hourly blocks)
  const availableHours: SelectedTimeSlot[] = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' },
    { start: '18:00', end: '19:00' },
    { start: '19:00', end: '20:00' },
    { start: '20:00', end: '21:00' },
    { start: '21:00', end: '22:00' },
    { start: '22:00', end: '23:00' },
  ];

  useEffect(() => {
    // Load active courts list
    const loadCourts = async () => {
      try {
        const res = await fetch('/api/courts');
        if (res.ok) {
          const data = await res.json();
          setCourtsList(data.filter((c: Court) => c.active === 1));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCourts();

    // Default dates setting
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // Fetch taken slots when court or date shifts
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      const loadAvailability = async () => {
        try {
          const res = await fetch(
            `/api/reservations/availability?date=${selectedDate}&courtId=${selectedCourt.id}`
          );
          if (res.ok) {
            const data = await res.json();
            setTakenSlots(data);
          }
        } catch (e) {
          console.error('Error fetching availability:', e);
        }
      };
      loadAvailability();
    }
  }, [selectedCourt, selectedDate]);

  // Recalculate price on hour selection or promo change
  useEffect(() => {
    if (selectedCourt && selectedTimeSlot) {
      const hoursCount = 1; // Standard 1-hr blocks
      const base = selectedCourt.hourlyRate * hoursCount;
      setBasePrice(base);

      let disc = 0;
      if (activePromo) {
        if (activePromo.discountType === 'percentage') {
          disc = (base * activePromo.discountValue) / 100;
        } else if (activePromo.discountType === 'fixed') {
          disc = activePromo.discountValue;
        }
      }

      setDiscountAmount(disc);
      setFinalPrice(Math.max(0, base - disc));
    }
  }, [selectedCourt, selectedTimeSlot, activePromo]);

  const testPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoMessage('');
    setPromoError('');

    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const promos = await res.json();
        const found = promos.find(
          (p: any) => p.code.toUpperCase() === promoCodeInput.toUpperCase() && p.active === 1
        );

        if (found) {
          setActivePromo(found);
          setPromoMessage(
            `¡Código de cupón [${found.code}] aplicado! Descuento de: ${
              found.discountType === 'percentage'
                ? `${found.discountValue}%`
                : `$${found.discountValue} MXN`
            }`
          );
        } else {
          setActivePromo(null);
          setPromoError('El cupón ingresado no es válido o ya caducó.');
        }
      }
    } catch (e) {
      setPromoError('Error al validar cupón.');
    }
  };

  const checkHourBookedState = (slot: SelectedTimeSlot) => {
    // Check if slot falls in any takenSlots range
    return takenSlots.some((taken) => {
      return (
        (slot.start >= taken.startTime && slot.start < taken.endTime) ||
        (slot.end > taken.startTime && slot.end <= taken.endTime)
      );
    });
  };

  const handleCreatePendingReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim() || !selectedTimeSlot) {
      alert('Favor de llenar todos los datos de contacto.');
      return;
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: selectedCourt?.id,
          date: selectedDate,
          startTime: selectedTimeSlot.start,
          endTime: selectedTimeSlot.end,
          clientName,
          clientPhone,
          clientEmail,
          promoCode: activePromo?.code,
        }),
      });

      if (res.status === 409) {
        alert('Conflicto: El horario seleccionado acaba de ser reservado por otro usuario.');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setNewReservation(data.reservation);
        setStep(4); // Move into Stripe Checkout!
      } else {
        alert('Hubo un contratiempo reservando tu cancha. Verifica los datos.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedCourt(null);
    setSelectedTimeSlot(null);
    setNewReservation(null);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setPromoCodeInput('');
    setActivePromo(null);
    setPromoMessage('');
    setPromoError('');
  };

  // Get minimum dates (today YYYY-MM-DD)
  const getMinDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get maximum dates (30 days from now)
  const getMaxDateString = () => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans text-left" id="reservations-page-container">
      {/* 1. Header with steps indicators */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest flex items-center gap-1.5 justify-start">
            <Calendar size={12} /> Reservas en Línea
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-1">
            Aparta tu Cancha
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">Completa tu reserva en menos de 3 minutos con confirmación instantánea.</p>
        </div>

        {/* Steps badge */}
        {step < 5 && (
          <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-900 p-2.5 rounded-2xl text-xs font-mono">
            <div className={`h-6 px-2.5 rounded-lg flex items-center justify-center font-bold font-sans ${step === 1 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-500'}`}>1</div>
            <span className="text-zinc-650">/</span>
            <div className={`h-6 px-2.5 rounded-lg flex items-center justify-center font-bold font-sans ${step === 2 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-500'}`}>2</div>
            <span className="text-zinc-650">/</span>
            <div className={`h-6 px-2.5 rounded-lg flex items-center justify-center font-bold font-sans ${step === 3 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-500'}`}>3</div>
            <span className="text-zinc-650">/</span>
            <div className={`h-6 px-2.5 rounded-lg flex items-center justify-center font-bold font-sans ${step === 4 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-500'}`}>4</div>
          </div>
        )}
      </div>

      {/* ==================== STEP 1: SELECT COURT ==================== */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            🏟️ Paso 1: Elige tu Terreno de Juego
          </h3>
          
          {courtsList.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-10">Cargando canchas oficiales de fútbol rápido...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courtsList.map((court) => (
                <div
                  key={court.id}
                  onClick={() => {
                    setSelectedCourt(court);
                    setStep(2);
                  }}
                  className="group bg-zinc-950 border border-zinc-900 hover:border-emerald-500/30 transition-all rounded-3xl overflow-hidden shadow-xl cursor-pointer text-left flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={court.imageUrl}
                      alt={court.name}
                      className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-zinc-900/90 border border-zinc-800 text-emerald-400 text-xs font-mono font-bold px-3 py-1.5 rounded-xl">
                      ${court.hourlyRate.toLocaleString('es-MX')} / HORA
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-400 transition">
                        {court.name}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">{court.description}</p>
                    </div>

                    <div className="flex gap-2 text-[10px] items-center border-t border-zinc-900 pt-3 text-zinc-400 font-mono scale-95 origin-left">
                      <span className="bg-zinc-900 px-2.5 py-1 rounded-xl border border-zinc-800">
                        {court.surface}
                      </span>
                      <span>•</span>
                      <span className="bg-zinc-900 px-2.5 py-1 rounded-xl border border-zinc-800">
                        {court.capacity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== STEP 2: SELECT DATE & TIME ==================== */}
      {step === 2 && selectedCourt && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Calendar picker column */}
          <div className="md:col-span-1 space-y-6 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl h-fit">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              📅 Fecha Reservas
            </h3>
            
            <div className="space-y-2 text-xs">
              <label className="text-zinc-400 font-medium font-sans">Elige un día:</label>
              <div className="relative">
                <input
                  type="date"
                  min={getMinDateString()}
                  max={getMaxDateString()}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTimeSlot(null);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-emerald-500 font-mono text-white text-sm"
                  id="date-picker-input"
                />
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed mt-1 font-sans">
                💡 Nota: Puedes reservar hasta con 30 días de anticipación de forma automatizada.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 p-4 bg-zinc-900/50 space-y-2.5 text-xs text-left font-sans">
              <span className="font-bold text-white block">Cancha Seleccionada</span>
              <p className="font-extrabold text-emerald-400 text-xs">{selectedCourt.name}</p>
              <div className="flex gap-2 text-[9px] text-zinc-400 font-mono">
                <span className="bg-zinc-800 px-2 py-0.5 rounded">{selectedCourt.surface}</span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded">{selectedCourt.capacity}</span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full mt-2 font-bold hover:underline text-emerald-400 text-[10px] flex items-center gap-1 justify-start"
              >
                ← Cambiar de Cancha
              </button>
            </div>
          </div>

          {/* Time Picker Slots column */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-3.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                ⏰ Horarios Disponibles ({selectedDate})
              </h3>
              
              {/* Mini colors guide */}
              <div className="flex gap-3 text-[10px] font-mono scale-95">
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Libre</div>
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Ocupado</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" id="reservation-hours-grid">
              {availableHours.map((slot, index) => {
                const isBooked = checkHourBookedState(slot);
                const isSelected = selectedTimeSlot?.start === slot.start;

                return (
                  <button
                    key={index}
                    disabled={isBooked}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`p-3.5 rounded-2xl text-xs font-mono flex flex-col items-center justify-center gap-1.5 transition border cursor-pointer ${
                      isBooked
                        ? 'bg-rose-500/5 border-rose-500/20 text-rose-500/30'
                        : isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/10 font-bold scale-[1.03]'
                        : 'bg-zinc-950 border-zinc-900 text-emerald-400 hover:border-emerald-500/30 hover:text-white'
                    }`}
                  >
                    <Clock size={14} className={isSelected ? 'text-black' : isBooked ? 'text-rose-500/20' : 'text-zinc-650'} />
                    <span>{slot.start} - {slot.end}</span>
                    <span className={`text-[9px] font-sans px-2 py-0.5 rounded-full ${
                      isBooked
                        ? 'bg-rose-500/10 text-rose-500'
                        : isSelected
                        ? 'bg-black/10 text-black'
                        : 'bg-emerald-950/40 text-emerald-500'
                    }`}>
                      {isBooked ? 'Ocupado' : 'Disponible'}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedTimeSlot && (
              <button
                onClick={() => setStep(3)}
                className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1 ml-auto cursor-pointer"
              >
                Siguiente Paso <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================== STEP 3: FILL CLIENT DETAILS ==================== */}
      {step === 3 && selectedCourt && selectedTimeSlot && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Details Form */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center gap-2">
              <User size={18} className="text-emerald-400" /> Paso 3: Información del Capitán del Equipo
            </h3>

            <form onSubmit={handleCreatePendingReservation} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-zinc-400 block font-medium">Nombre Completo del Responsable</label>
                <input
                  type="text"
                  placeholder="Carlos Mendoza"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-medium">Teléfono / WhatsApp de Contacto</label>
                  <input
                    type="tel"
                    placeholder="5512345678"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-medium">Correo Electrónico para Recibo</label>
                  <input
                    type="email"
                    placeholder="carlos@correo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              {/* Coupon inputs */}
              <div className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-2xl space-y-2">
                <label className="text-zinc-400 font-semibold flex items-center gap-1.5"><Ticket size={14} className="text-emerald-400" /> ¿Tienes un código de descuento?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="EJ: LUNES20"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-emerald-500 text-xs font-mono uppercase text-emerald-450 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={testPromoCode}
                    className="rounded-xl px-4 py-3 bg-zinc-800 hover:bg-zinc-750 text-white font-bold cursor-pointer transition border border-zinc-700/50 text-[11px]"
                  >
                    Validar
                  </button>
                </div>
                {promoMessage && <p className="text-[10px] text-emerald-400 font-bold">✓ {promoMessage}</p>}
                {promoError && <p className="text-[10px] text-rose-400">⚠️ {promoError}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl px-5 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer uppercase py-3.5 shadow-lg shadow-emerald-500/10"
                >
                  Proceder al Pago <ChevronRight size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* Order Snapshot Summary Column */}
          <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl h-fit space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              📝 Resumen del Partido
            </h3>

            <div className="space-y-3 text-xs tracking-wide font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Cancha:</span>
                <span className="font-sans font-bold text-white text-right">{selectedCourt.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Superficie:</span>
                <span className="text-zinc-400">{selectedCourt.surface}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Categoría:</span>
                <span className="text-zinc-400">{selectedCourt.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fecha:</span>
                <span className="text-emerald-400">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tiempo:</span>
                <span className="text-emerald-400">{selectedTimeSlot.start} A {selectedTimeSlot.end} HS</span>
              </div>
              
              <hr className="border-zinc-900" />
              
              <div className="flex justify-between font-sans text-xs">
                <span className="text-zinc-400 font-medium">Subtotal regular:</span>
                <span className="font-mono text-zinc-300">${basePrice.toLocaleString('es-MX')} MXN</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between font-sans text-xs text-emerald-400">
                  <span className="font-bold">Descuento Cupón:</span>
                  <span className="font-mono">-${discountAmount.toLocaleString('es-MX')} MXN</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2.5 bg-zinc-900 border-y border-zinc-800 -mx-6 px-6 font-sans">
                <span className="font-black text-white uppercase tracking-wide text-[11px]">Total a Liquidar:</span>
                <span className="text-lg font-extrabold text-emerald-400 font-mono">${finalPrice.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 p-4 bg-zinc-900/40 text-[10px] text-zinc-400 flex gap-2 leading-relaxed">
              <Info size={16} className="text-emerald-400 shrink-0" />
              <p>El total del partido se procesará de forma inmediata para bloquear el casillero en el sistema central enlazado al árbitro.</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STEP 4: PAYMENT COMPONENT OVERLAY ==================== */}
      {step === 4 && selectedCourt && selectedTimeSlot && newReservation && (
        <div className="flex items-center justify-center py-6">
          <PaymentForm
            reservationId={newReservation.id}
            courtName={selectedCourt.name}
            date={selectedDate}
            timeSlot={`${selectedTimeSlot.start}-${selectedTimeSlot.end}`}
            amount={finalPrice}
            clientEmail={clientEmail}
            onPaymentSuccess={() => {
              setStep(5); // Complete success overlay
            }}
            onCancel={resetFlow}
          />
        </div>
      )}

      {/* ==================== STEP 5: FINAL TICK SUCCESS OVERLAY ==================== */}
      {step === 5 && (
        <div className="max-w-xl mx-auto bg-zinc-950 border border-emerald-500/10 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-350">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={42} className="stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">¡Todo Listo Para Jugar!</h2>
            <p className="text-sm text-zinc-400">Tu partido ha quedado agendado y confirmado en el sistema central del deportivo.</p>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-850 p-6 space-y-3 text-xs tracking-wide text-left font-mono">
            <div className="flex justify-between border-b border-zinc-800 pb-2 mb-2 text-emerald-400 font-bold">
              <span>ESTADO DE RESERVA:</span>
              <span>DEPÓSITO CONFIRMADO</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Cancha:</span>
              <span className="text-white font-sans">{selectedCourt?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Fecha partido:</span>
              <span className="text-white">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Horario juego:</span>
              <span className="text-emerald-400">{selectedTimeSlot?.start} A {selectedTimeSlot?.end} HS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Capitán:</span>
              <span className="text-white font-sans font-bold">{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Monto total pagado:</span>
              <span className="text-emerald-400 font-extrabold">${finalPrice.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <button
              onClick={resetFlow}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
            >
              Hacer Otra Reserva
            </button>
            <a
              href="https://wa.me/5215512345678"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
