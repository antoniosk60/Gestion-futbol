import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Camera, RefreshCw, Plus, Tag, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface GalleryPhoto {
  id: number;
  title: string;
  imageUrl: string;
  category: string;
  description?: string;
  createdAt: string;
}

export default function AdminGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('canchas');
  const [description, setDescription] = useState('');
  const [imageFileBase64, setImageFileBase64] = useState('');
  const [fileNameLabel, setFileNameLabel] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // Convert File object to Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setNotifError('Por favor ingresa únicamente archivos de tipo imagen (.png, .jpeg, .jpg, .webp).');
      return;
    }

    // Max 10MB just to keep buffer transmission smooth
    if (file.size > 10 * 1024 * 1024) {
      setNotifError('La imagen excede el límite recomendado de carga.');
      return;
    }

    setFileNameLabel(file.name);
    setNotifError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setNotifError('Contratiempo al descodificar los metadatos de la imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageFileBase64) {
      setNotifError('Completa todos los campos obligatorios y selecciona una imagen para subir.');
      return;
    }

    setIsUploading(true);
    setNotifSuccess('');
    setNotifError('');

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          imageFileBase64,
          category,
          description,
        }),
      });

      if (res.ok) {
        setNotifSuccess('⚽ ¡Fotografía subida al servidor con éxito!');
        setTitle('');
        setDescription('');
        setImageFileBase64('');
        setFileNameLabel('');
        
        // Reload list
        loadPhotos();
      } else {
        throw new Error('Falla en la respuesta al registrar imagen en galería.');
      }
    } catch (err: any) {
      setNotifError(err.message || 'Contratiempo al subir fotografía.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta foto de la galería?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200 font-sans text-left" id="admin-gallery-container">
      
      {/* 1. UPLOADING FORM SIDEBAR */}
      <div className="lg:col-span-1 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl h-fit space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-3">
            <Plus size={16} className="text-emerald-400" /> Subir Nueva Fotografía
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">Crea registros fotográficos y expónlos en la galería principal.</p>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium">Título de la Foto *</label>
            <input
              type="text"
              placeholder="Ej: Final de Liga Nocturna"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500 font-sans font-medium"
              disabled={isUploading}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium">Categoría *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-xs text-zinc-300 font-sans"
              disabled={isUploading}
              required
            >
              <option value="canchas">⚽ Canchas</option>
              <option value="eventos">🏆 Eventos y Torneos</option>
              <option value="instalaciones">🏟️ Instalaciones y Cafetería</option>
            </select>
          </div>

          {/* DRAG AND DROP FILE INPUT */}
          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium">Archivo de Imagen *</label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : imageFileBase64
                  ? 'border-emerald-500/30 bg-zinc-900/40'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
              }`}
            >
              <input
                type="file"
                id="gallery-file-input"
                onChange={handleFileInput}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              
              <Upload size={22} className={imageFileBase64 ? 'text-emerald-400 animate-bounce' : 'text-zinc-500'} />
              
              <p className="text-[11px] text-zinc-300">
                {fileNameLabel ? (
                  <span className="font-bold text-white font-mono break-all">{fileNameLabel}</span>
                ) : (
                  'Arrastra una imagen aquí o haz clic para buscar.'
                )}
              </p>
              <p className="text-[9px] text-zinc-550 leading-none">Formatos aceptados: PNG, JPG, WEBP (Max 10MB)</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 block font-medium">Breve Descripción</label>
            <textarea
              rows={3}
              placeholder="Opcional: Detalla el suceso o la cancha expuesta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
              disabled={isUploading}
            />
          </div>

          {notifSuccess && (
            <p className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-1">
              <CheckCircle size={12} /> {notifSuccess}
            </p>
          )}

          {notifError && (
            <p className="text-[10px] text-rose-450 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl flex items-center gap-1 leading-normal">
              <AlertTriangle size={12} className="shrink-0" /> {notifError}
            </p>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {isUploading ? 'Subiendo Archivo...' : 'Publicar Foto'}
          </button>
        </form>
      </div>

      {/* 2. CHRONOLOGY OF GALLERY PHOTOS LIST */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider">📸 Catálogo de la Galería</h2>
            <p className="text-[11px] text-zinc-500">Mapeo de archivos de almacenamiento y registros de fotos.</p>
          </div>
          <button
            onClick={loadPhotos}
            className="rounded-full p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Refrescar fotos"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-zinc-500 font-mono text-center py-12">Sincronizando fotos de la base de datos...</p>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl text-xs text-zinc-500">
            Aún no hay fotos registradas para mostrar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex gap-4 text-left shadow-lg items-center relative overflow-hidden"
              >
                {/* Image miniature square */}
                <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="h-full w-full object-cover filter brightness-90"
                  />
                </div>

                {/* Details layout */}
                <div className="flex-1 space-y-1 text-xs">
                  <h4 className="font-extrabold text-white text-xs leading-snug line-clamp-1">{photo.title}</h4>
                  <div className="flex items-center gap-1 text-[9px] font-mono tracking-wider text-zinc-400">
                    <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded leading-none text-emerald-400">
                      {photo.category}
                    </span>
                    <span>•</span>
                    <span>ID #{photo.id}</span>
                  </div>
                  {photo.description && (
                    <p className="text-[10px] text-zinc-500 line-clamp-1 font-sans">{photo.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="rounded-full p-2 bg-rose-950/20 border border-rose-500/10 text-rose-400 hover:bg-rose-900 hover:text-white transition cursor-pointer"
                  title="Eliminar foto permanentemente"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
