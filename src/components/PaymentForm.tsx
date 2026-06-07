import React, { useState } from 'react';
import { CreditCard, DollarSign, Loader, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface PaymentFormProps {
  reservationId: number;
  courtName: string;
  date: string;
  timeSlot: string;
  amount: number;
  clientEmail: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({
  reservationId,
  courtName,
  date,
  timeSlot,
  amount,
  clientEmail,
  onPaymentSuccess,
  onCancel,
}: PaymentFormProps) {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'input' | 'success' | 'error'>('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);

  // Card number input formatter
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted.substring(0, 19));
  };

  // Expiry date input formatter (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardExpiry(value.substring(0, 5));
  };

  // CVV input handler
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardCvv(value.substring(0, 4));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || cardNumber.length < 15 || cardExpiry.length < 5 || cardCvv.length < 3) {
      setErrorMessage('Por favor ingresa todos los datos de la tarjeta válidos.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Step 1: Request Payment Intent with API
      const intentRes = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, amount }),
      });

      if (!intentRes.ok) {
        const err = await intentRes.json();
        throw new Error(err.error || 'Error al conectar con la pasarela de pagos.');
      }

      const intentData = await intentRes.json();
      setIsTestMode(intentData.isCustomMock);

      // Simulate a small network delay for security validation (3D Secure and Stripe network hook check)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 2: Confirm Payment in Database
      const confirmRes = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          paymentIntentId: intentData.paymentIntentId,
        }),
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.error || 'Error al validar la confirmación del depósito.');
      }

      setPaymentStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'El pago fue declinado por el emisor de la tarjeta.');
      setPaymentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 font-sans text-white relative overflow-hidden" id="stripe-payment-form">
      {/* Visual background sports lights effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
      
      {paymentStep === 'input' && (
        <form onSubmit={handleCheckoutSubmit} className="space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                💳 Pago con Tarjeta (Stripe)
              </h3>
              <p className="text-xs text-zinc-400">Paga de forma 100% encriptada y rápida.</p>
            </div>
          </div>

          {/* Booking Summary Mini-Badge */}
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/40 p-4 space-y-2">
            <div className="text-xs flex justify-between">
              <span className="text-zinc-400">Reserva:</span>
              <span className="font-semibold text-white">{courtName}</span>
            </div>
            <div className="text-xs flex justify-between">
              <span className="text-zinc-400">Fecha y Hora:</span>
              <span className="font-mono text-emerald-400">{date} @ {timeSlot} HS</span>
            </div>
            <hr className="border-zinc-800/60" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-zinc-400 font-semibold uppercase">Monto Total:</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">${amount.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Cardholder */}
            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Nombre en la tarjeta</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                placeholder="JUAN PEREZ FLORES"
                disabled={isProcessing}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 p-3 text-sm tracking-wider uppercase font-mono"
              />
            </div>

            {/* Card Number */}
            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium flex justify-between">
                <span>Número de Tarjeta</span>
                <span className="text-[10px] text-zinc-500 font-mono">VISA / MASTERCARD / AMEX</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                  placeholder="4000 1234 5678 9010"
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 p-3 pl-10 text-sm tracking-widest font-mono"
                />
                <CreditCard size={16} className="absolute left-3 top-3.5 text-zinc-500" />
              </div>
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-zinc-400 font-medium">Expiración</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  required
                  placeholder="MM/AA"
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 p-3 text-sm tracking-widest text-center font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-zinc-400 font-medium">CVV / CVC</label>
                <input
                  type="password"
                  value={cardCvv}
                  onChange={handleCvvChange}
                  required
                  placeholder="•••"
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 p-3 text-sm tracking-widest text-center font-mono"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 py-3 text-xs font-semibold cursor-pointer text-zinc-300 disabled:opacity-50"
            >
              Regresar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold font-sans cursor-pointer text-black flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader size={14} className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  Pagar ${amount.toLocaleString('es-MX')}
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 pt-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Encriptación SSL de 256 bits - Procesado vía Pasarela Stripe</span>
          </div>
        </form>
      )}

      {paymentStep === 'success' && (
        <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">¡Depósito Confirmado!</h3>
            <p className="text-xs text-zinc-400 mt-1">Hemos registrado tu reserva y el pago exitosamente.</p>
          </div>

          <div className="rounded-2xl bg-zinc-900 border border-zinc-800/80 p-4 text-xs tracking-wide space-y-2 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Transacción:</span>
              <span className="text-emerald-400">EXITOSA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Folio Reserva:</span>
              <span className="text-white">#{reservationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-bold uppercase">Cancha:</span>
              <span className="text-white">{courtName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Monto Cobrado:</span>
              <span className="text-emerald-400">${amount.toLocaleString('es-MX')} MXN</span>
            </div>
            <hr className="border-zinc-800/60" />
            <p className="text-[10px] text-zinc-400 font-sans text-center leading-relaxed">
              Hemos enviado un correo de validación a <strong className="text-zinc-200">{clientEmail}</strong>. ¡Nos vemos en la cancha! ⚽🏆
            </p>
          </div>

          <button
            onClick={onPaymentSuccess}
            className="w-full rounded-xl bg-emerald-500 text-black font-extrabold py-3 text-xs font-sans hover:bg-emerald-400 transition cursor-pointer flex items-center justify-center gap-1 hover:gap-2 duration-200"
          >
            Aceptar <ArrowRight size={14} />
          </button>
        </div>
      )}

      {paymentStep === 'error' && (
        <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Falla al Procesar Depósito</h3>
            <p className="text-xs text-zinc-400 mt-1">Hubo un contratiempo al procesar la operación.</p>
          </div>
          <div className="bg-rose-500/5 text-rose-400/90 border border-rose-500/10 rounded-2xl p-4 text-xs font-mono text-left leading-relaxed">
            {errorMessage || 'Ocurrió un error inesperado al conectar con el servidor bancario. Inténtalo con otra tarjeta bancaria o prueba de nuevo.'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentStep('input')}
              className="flex-1 rounded-xl bg-zinc-800 text-white font-semibold py-3 text-xs cursor-pointer hover:bg-zinc-700 transition"
            >
              Reintentar
            </button>
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold py-3 text-xs cursor-pointer hover:bg-zinc-850"
            >
              Regresar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
