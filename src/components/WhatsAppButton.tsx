import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Format custom message for rapid soccer field support
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5215512345678?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="whatsapp-floating-button">
      {isOpen ? (
        <div className="mb-3 w-80 rounded-2xl bg-zinc-950 border border-emerald-500/30 p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Soporte Goleada FC</h4>
                <p className="text-xs text-zinc-400">Respuesta promedio: ~5 min</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              id="whatsapp-close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="py-4 text-xs text-zinc-300">
            <p>⚽ ¡Hola! Platícanos con qué podemos ayudarte hoy: apartados especiales, cotizaciones de torneos, dudas o facturas.</p>
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-sans"
              id="whatsapp-input"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-500 transition flex items-center justify-center cursor-pointer"
              id="whatsapp-submit"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/20"
        title="Chatear por WhatsApp"
        id="whatsapp-trigger-btn"
      >
        <MessageSquare size={24} className="stroke-[2.5]" />
      </button>
    </div>
  );
}
