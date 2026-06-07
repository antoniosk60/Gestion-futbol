import { useEffect, useState } from 'react';
import { Camera, Search, X, Maximize2, Tag, Calendar, Layout } from 'lucide-react';

export interface GalleryPhoto {
  id: number;
  title: string;
  imageUrl: string;
  category: string;
  description?: string;
  createdAt: string;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch photos
    const loadPhotos = async () => {
      try {
        const res = await fetch(`/api/gallery${activeCategory !== 'todos' ? `?category=${activeCategory}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          setPhotos(data);
        }
      } catch (err) {
        console.error('Error loading gallery photos:', err);
      }
    };
    loadPhotos();
  }, [activeCategory]);

  const categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'canchas', label: 'Canchas' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'instalaciones', label: 'Instalaciones' }
  ];

  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch =
      photo.title.toLowerCase().includes(search.toLowerCase()) ||
      (photo.description && photo.description.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans" id="gallery-page-container">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="text-left space-y-1">
          <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-widest flex items-center gap-1">
            <Camera size={12} /> Galería Visual
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">Galería de Canchas</h1>
          <p className="text-xs sm:text-sm text-zinc-400"> Explora capturas de nuestras canchas, torneos estelares y amenidades VIP. </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar fotos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-900 focus:outline-none focus:border-emerald-500 text-xs text-white"
          />
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border ${
              activeCategory === cat.value
                ? 'bg-emerald-500 text-black border-emerald-400/20'
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white hover:border-zinc-800'
            }`}
          >
            <Tag size={12} /> {cat.label}
          </button>
        ))}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-650">
            <Camera size={22} />
          </div>
          <p className="text-sm text-zinc-400">Aún no hay fotografías en la galería.</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-3xl">
          <p className="text-sm text-zinc-400">Ninguna fotografía coincide con tu filtro.</p>
        </div>
      ) : (
        /* Bento Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="gallery-grid">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="relative group aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-950 cursor-zoom-in group shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 duration-300 transition-all"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                loading="lazy" // Native lazy-loading
                className="w-full h-full object-cover filter brightness-[0.85] group-hover:brightness-100 group-hover:scale-105 duration-500 transition-all"
              />
              {/* Overlay with tags */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 duration-300 transition-all p-4 flex flex-col justify-end text-left">
                <div className="space-y-1">
                  <span className="inline-block text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {photo.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                    {photo.title} <Maximize2 size={12} className="text-zinc-400 ml-auto shrink-0" />
                  </h4>
                  {photo.description && (
                    <p className="text-[10px] text-zinc-400 line-clamp-1 font-sans">{photo.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Zoom Overlay Preview */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" id="gallery-lightbox">
          <div className="relative max-w-4xl w-full bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Image section */}
            <div className="flex-1 bg-black flex items-center justify-center max-h-[480px] md:max-h-[640px]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Details section */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950 text-left">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase font-bold text-[9px] tracking-wider leading-none">
                    {selectedPhoto.category}
                  </span>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="rounded-full p-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">{selectedPhoto.title}</h3>
                  {selectedPhoto.description && (
                    <p className="text-xs text-zinc-455 font-sans leading-relaxed">{selectedPhoto.description}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 mt-6 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1"><Calendar size={12} /> {selectedPhoto.createdAt.split('T')[0]}</span>
                <span>ID #{selectedPhoto.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
