import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';

export interface AppNotification {
  id: number;
  message: string;
  type: 'new_reservation' | 'payment_confirmed' | 'reminder' | 'info';
  read: number;
  createdAt: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 45 seconds to keep dashboard up-to-date
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => n.read === 0).length;

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/clear', { method: 'POST' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: 1 } : n))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-MX', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="relative inline-block text-left" id="notification-center-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
        id="notification-bell-btn"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black border-2 border-zinc-950">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-4 text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                📢 Centro de Alertas
                {unreadCount > 0 && (
                  <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {unreadCount} pendientes
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-zinc-400 hover:text-emerald-400 transition cursor-pointer flex items-center gap-1"
                    title="Marcar todo como leído"
                  >
                    <Check size={12} /> Vaciar
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white transition"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto mt-2 space-y-2 divide-y divide-zinc-900 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Aún no hay notificaciones de sistema.
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id}
                    className={`pt-3 flex flex-col gap-1 text-xs first:pt-1 ${
                      n.read === 0 ? 'bg-emerald-500/5 -mx-2 px-2 rounded-lg' : 'opacity-70'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            n.type === 'new_reservation'
                              ? 'bg-blue-400'
                              : n.type === 'payment_confirmed'
                              ? 'bg-emerald-400'
                              : n.type === 'reminder'
                              ? 'bg-amber-400'
                              : 'bg-zinc-400'
                          }`}
                        />
                        <span className="font-semibold uppercase text-[10px] tracking-wider text-zinc-400">
                          {n.type === 'new_reservation'
                            ? 'Creación'
                            : n.type === 'payment_confirmed'
                            ? 'Pago'
                            : n.type === 'reminder'
                            ? 'Recordatorio'
                            : 'Info'}
                        </span>
                      </div>
                      {n.read === 0 && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          Leído
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-200 mt-0.5 leading-relaxed font-sans">{n.message}</p>
                    <span className="text-[10px] text-zinc-500 text-right mt-1 font-mono">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
