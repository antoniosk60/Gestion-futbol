import React from 'react';
import { ShieldCheck, Lock, FileText, Scale } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 font-sans text-left" id="privacy-page-container">
      {/* Page Title */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest flex items-center gap-1.5 justify-start">
          <ShieldCheck size={12} /> Sección Legal
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-1">Términos, Condiciones y Privacidad</h1>
        <p className="text-xs sm:text-sm text-zinc-400">Consulta nuestras políticas sobre reembolso por lluvias, apartados de canchas de fútbol rápido y tratamiento de tus datos personales.</p>
      </div>

      <div className="space-y-6 text-zinc-350 text-xs sm:text-sm leading-relaxed" id="terms-sections">
        
        {/* Section 1 */}
        <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-lg space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock size={16} className="text-emerald-400" /> 1. Aviso de Privacidad de Datos Recabados
          </h3>
          <p>
            En <strong>Complejo Goleada FC</strong>, nos tomamos muy en serio la seguridad de los datos de nuestros capitanes de equipo. Sus datos personales como nombre, correo electrónico y número de teléfono celular son recopilados con el único propósito de validar reservaciones, tramitar notificaciones de recordatorios automáticos por WhatsApp y garantizar cargos bancarios transparentes y seguros. Sus datos jamás serán compartidos, rentados o vendidos con fines publicitarios de terceras empresas ajenas de nuestra administración.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-lg space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-emerald-400" /> 2. Políticas de Cancelación y Reembolso
          </h3>
          <p>
            Al agendar un casillero de hora en nuestra plataforma Goleada FC, usted acepta los siguientes términos de juego:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 font-sans">
            <li><strong>Reagendamiento y clima:</strong> En caso de lluvias torrenciales o tormentas eléctricas que impidan el uso seguro de nuestras canchas de fútbol (excluyendo los domos techados debidamente climatizados), usted podrá reprogramar su partido para cualquier otro día disponible de la semana sin ningún cargo de penalización adicional.</li>
            <li><strong>Cancelaciones por iniciativa del cliente:</strong> Para obtener un reembolso completo del depósito regular, el capitán del equipo deberá notificar la cancelación con un margen mínimo de 24 horas previas al pitazo inicial de su reserva pactada.</li>
            <li><strong>Tolerancia:</strong> Se ofrece un tiempo de espera máximo de 15 minutos en la entrada de la cancha. Pasado ese tiempo, el casillero se considerará inasistencia (No-Show) del equipo y la cancha podrá cederse a retas libres, sin derecho a devolución de pago.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-lg space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Scale size={16} className="text-emerald-400" /> 3. Reglamento Interno de Conducta Deportiva
          </h3>
          <p>
            Con el propósito de mantener canchas seguras, de sana convivencia familiar y de juego limpio, todos los jugadores y acompañantes deberán respetar las siguientes pautas éticas en el deportivo:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 font-sans">
            <li>Uso obligatorio de multitacos o tenis deportivos lisos. Queda estrictamente prohibido el calzado metálico tipo "tacos de aluminio" para proteger la integridad del pasto sintético monofilamento.</li>
            <li>Prohibido arrojar chicles, ingresar con envases de vidrio, alimentos dentro de los perímetros de la jaula, o participar en altercados físicos. Cualquier riña física o agresión verbal resultará en suspensión permanente del equipo entero en todo nuestro circuito de torneos.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
