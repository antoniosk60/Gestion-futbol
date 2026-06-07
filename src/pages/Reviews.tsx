import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle, ShieldCheck } from 'lucide-react';

interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function Reviews() {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadApprovedReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviewsList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadApprovedReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setErrorMsg('Por favor introduce tu nombre y un comentario de opinión.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, rating, comment }),
      });

      if (!res.ok) {
        throw new Error('Error al registrar tu reseña.');
      }

      setSuccess(true);
      setAuthorName('');
      setComment('');
      setRating(5);
      
      // Load list again
      loadApprovedReviews();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-200 font-sans text-left" id="reviews-page-container">
      {/* Page Title */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest flex items-center gap-1.5 justify-start">
          <MessageSquare size={12} /> Comentarios de Clientes
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-1">Opiniones y Reseñas</h1>
        <p className="text-xs sm:text-sm text-zinc-400">Lee de primera mano la experiencia de juego de capitanes y equipos de nuestra cancha.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Feed of approved reviews */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            ⭐ Reseñas de la Comunidad ({reviewsList.length})
          </h3>

          {reviewsList.length === 0 ? (
            <div className="py-20 text-center bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-550 leading-relaxed text-xs">
              De momento no hay opiniones aprobadas aún. ¡Sé el primero en compartir tu experiencia!
            </div>
          ) : (
            <div className="space-y-4" id="approved-reviews-list">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg space-y-3 hover:border-zinc-800 transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-800"}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{rev.date}</span>
                  </div>
                  <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans italic">
                    "{rev.comment}"
                  </p>
                  <div className="flex items-center gap-2 border-t border-zinc-900/80 pt-2.5">
                    <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-[10px] text-emerald-400 uppercase">
                      {rev.authorName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-300">{rev.authorName}</span>
                      <span className="text-[9px] text-zinc-500 block">Capitán Verificado</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Form to submit reviews */}
        <div className="lg:col-span-1 h-fit bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">✍️ Deja tu Calificación</h3>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl space-y-2 text-xs leading-relaxed">
              <CheckCircle size={24} className="text-emerald-400" />
              <h4 className="font-bold text-white">¡Gracias por tu opinión!</h4>
              <p>Tu comentario ha sido enviado. Para mantener un ambiente amigable y libre de spam, se mostrará públicamente una vez que el administrador lo apruebe.</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 text-[10px] text-emerald-400 font-extrabold hover:underline"
              >
                Escribir otra reseña
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 block font-medium">Nombre de Capitán / Equipo</label>
                <input
                  type="text"
                  placeholder="Carlos G."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Star selector */}
              <div className="space-y-1">
                <label className="text-zinc-400 block font-medium">Calificación</label>
                <div className="flex gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((starsCount) => (
                    <button
                      type="button"
                      key={starsCount}
                      onClick={() => setRating(starsCount)}
                      className="p-1 text-zinc-400 hover:scale-110 active:scale-95 transition cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={starsCount <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 font-sans">
                  {rating === 5 ? '🏆 ¡Excelente servicio!' : rating === 4 ? '⚽ Muy buen servicio.' : '📌 Detalla tu experiencia.'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-medium">Comentario de Experiencia</label>
                <textarea
                  rows={4}
                  placeholder="Platícanos qué tal estuvo el juego, las luces de la cancha, vestidores, etc..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {errorMsg && <p className="text-rose-400 text-xs">⚠️ {errorMsg}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 uppercase"
              >
                {isSubmitting ? 'Enviando...' : (
                  <>
                    Publicar Reseña <Send size={12} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 pt-2 border-t border-zinc-900">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Reseña sujeta a términos de sana convivencia deportiva.</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
