import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, Trash2, RefreshCw, Eye, MessageSquare, ShieldAlert } from 'lucide-react';

interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
  approved: number;
}

export default function AdminReviews() {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews?all=true'); // Fetch all including pending
      if (res.ok) {
        const data = await res.json();
        setReviewsList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReviews();
  }, []);

  const handleApproveToggle = async (id: number, currentApprovedState: number) => {
    const nextApprovedState = currentApprovedState === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/reviews/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: nextApprovedState }),
      });

      if (res.ok) {
        setReviewsList((prev) =>
          prev.map((r) => (r.id === id ? { ...r, approved: nextApprovedState } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('¿Deseas remover permanentemente esta recomendación opinada del sistema?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviewsList((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-left" id="admin-reviews-container">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">Aprobación de Comentarios</h1>
          <p className="text-xs sm:text-sm text-zinc-400">Modera opiniones enviadas por tus clientes para mantener la calidad y el respeto deportivo.</p>
        </div>
        <button
          onClick={loadAllReviews}
          className="rounded-full p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-zinc-500 font-mono text-center py-12">Moderando opiniones del servidor...</p>
      ) : reviewsList.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl text-sm text-zinc-505 font-sans leading-relaxed">
          Ningún cliente ha enviado reseñas u opiniones al deportivo aún.
        </div>
      ) : (
        /* GRID OF REVIEWS TO MODERATE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="admin-reviews-grid">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-850"}
                      />
                    ))}
                  </div>
                  
                  {/* Approval state badge */}
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                    rev.approved === 1
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {rev.approved === 1 ? 'Aprobado (Público)' : 'Moderación Pendiente'}
                  </span>
                </div>

                <p className="text-zinc-300 text-xs sm:text-sm font-sans italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] text-zinc-500 font-mono">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 font-bold font-sans text-emerald-400 flex items-center justify-center">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-zinc-300 leading-none">{rev.authorName}</span>
                    <span className="text-[9px] text-zinc-550 mt-0.5">{rev.date}</span>
                  </div>
                </div>

                {/* MODERATION BUTTON SETS */}
                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <button
                    onClick={() => handleApproveToggle(rev.id, rev.approved)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] uppercase font-bold cursor-pointer transition border ${
                      rev.approved === 1
                        ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400'
                        : 'bg-emerald-600 hover:bg-emerald-555 border-emerald-500 text-black'
                    }`}
                  >
                    {rev.approved === 1 ? 'Desaprobar' : 'Aprobar'}
                  </button>

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-500/10 text-rose-450 hover:bg-rose-900 hover:text-white transition cursor-pointer"
                    title="Remover reseña permanentemente"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
