import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldCheck, Map } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Por favor completa todos los campos del formulario.');
      return;
    }

    setIsSending(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        throw new Error('Error al registrar tu consulta. Inténtalo de nuevo.');
      }

      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const contacts_info = [
    {
      icon: <Phone size={18} className="text-emerald-400" />,
      label: "Teléfono y WhatsApp",
      detail: "+52 (55) 1234-5678",
    },
    {
      icon: <Mail size={18} className="text-emerald-400" />,
      label: "Correo de Soporte",
      detail: "soporte@goleadafc.com",
    },
    {
      icon: <MapPin size={18} className="text-emerald-400" />,
      label: "Dirección Oficial",
      detail: "Av. de los Campeones Col. Estadio, 11500 CDMX, México",
    },
    {
      icon: <Clock size={18} className="text-emerald-400" />,
      label: "Horarios de Operación",
      detail: "Lunes a Domingo: 08:00 AM - 11:00 PM",
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-200 font-sans text-left" id="contact-page-container">
      {/* Title Header */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest flex items-center gap-1.5 justify-start">
          <MapPin size={12} /> Contacto & Ubicación
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-1">Cómo Encontrarnos</h1>
        <p className="text-xs sm:text-sm text-zinc-400">¿Tienes dudas sobre presupuestos de torneos, renta de domos de fútbol rápido o patrocinios? Escríbenos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left column: Cards & Message Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts_info.map((info, idx) => (
              <div
                key={idx}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex gap-3 text-left shadow-lg hover:border-zinc-800 transition duration-150"
              >
                <div className="h-10 w-10 p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  {info.icon}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-500">
                    {info.label}
                  </span>
                  <p className="text-xs text-zinc-200 font-medium leading-normal">{info.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">📩 Envíanos un correo rápido</h3>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-2xl space-y-3 leading-relaxed text-xs">
                <CheckCircle2 size={32} className="text-emerald-400" />
                <h4 className="font-bold text-white">¡Mensaje Enviado con Éxito!</h4>
                <p>Tu solicitud ha sido transmitida de inmediato al panel de administración. Te daremos una respuesta a la brevedad posible.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-3.5 py-2 leading-none bg-emerald-500 text-black font-extrabold rounded-lg hover:bg-emerald-400 cursor-pointer text-[10px]"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400">Nombre Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Manuel"
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 p-3 text-white"
                      disabled={isSending}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400">Correo Electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 p-3 text-white"
                      disabled={isSending}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400">Asunto</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Inscripción de torneo / Cotización"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 p-3 text-white"
                    disabled={isSending}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400">Mensaje</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Platícanos los detalles de tu consulta deportiva..."
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 p-3 text-white leading-relaxed font-sans"
                    disabled={isSending}
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
                    ⚠️ {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold py-3.5 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isSending ? 'Enviando...' : (
                    <>
                      Enviar Consulta <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right column: Interactive Soccer Turf Map Simulation */}
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full space-y-4 min-h-[440px]">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">📍 Mapa del Complejo Deportivo</h3>
                <p className="text-[10px] text-zinc-500">Haz clic para abrir ruta en el navegador móvil.</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-mono text-emerald-400">
                Lat: 19.4326, Lng: -99.1332
              </div>
            </div>

            {/* Beautiful graphic representation of fields */}
            <div className="bg-zinc-900 rounded-2xl aspect-[4/3] border border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center text-center p-4 shadow-inner">
              {/* Soccer field grass stripes simulator */}
              <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-emerald-800' : 'bg-emerald-900'}`} />
                ))}
              </div>
              {/* Soccer center pitch line drawings */}
              <div className="absolute inset-0 border-[3px] border-white/10 m-6 rounded-xl flex items-center justify-center pointer-events-none">
                <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-white/15" />
                <div className="h-20 w-20 border-[3px] border-white/15 rounded-full" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-20 border-[3px] border-l-0 border-white/15" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-20 border-[3px] border-r-0 border-white/15" />
              </div>

              {/* Pin indicator marker */}
              <div className="relative z-10 flex flex-col items-center select-none cursor-pointer animate-bounce hover:scale-110 duration-200">
                <div className="bg-zinc-950 border border-emerald-400 text-[10px] text-white font-bold px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-1">
                  🏟️ Camp FC Goleada
                </div>
                {/* Carrot tag */}
                <div className="w-2.5 h-2.5 bg-zinc-950 border-r border-b border-emerald-400 rotate-45 -mt-1.5" />
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/90 border border-zinc-850 backdrop-blur-md px-3.5 py-2.5 rounded-xl text-left text-[10px] text-zinc-350">
                <span className="font-bold text-white block">Complejo Goleada</span>
                <p className="mt-0.5">Av. de los Campeones Col. Estadio. Conexión rápida a Metrobus y estacionamiento seguro.</p>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              <a
                href="https://maps.google.com/?q=Av.+de+los+Campeones+Estadio+CDMX"
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold py-3 text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Map size={14} className="text-emerald-400" /> Cómo llegar con Google Maps
              </a>
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Complejo vigilado por cámaras de circuito cerrado de 24 horas.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
