import React, { useState } from 'react';
import Home from './pages/Home.tsx';
import Reservations from './pages/Reservations.tsx';
import Promotions from './pages/Promotions.tsx';
import Gallery from './pages/Gallery.tsx';
import Reviews from './pages/Reviews.tsx';
import Contact from './pages/Contact.tsx';
import Privacy from './pages/Privacy.tsx';

// Admin imports
import AdminDashboard from './pages/AdminDashboard.tsx';
import AdminReservations from './pages/AdminReservations.tsx';
import AdminGallery from './pages/AdminGallery.tsx';
import AdminPromotions from './pages/AdminPromotions.tsx';
import AdminPrices from './pages/AdminPrices.tsx';
import AdminReviews from './pages/AdminReviews.tsx';

// Universal Widgets
import WhatsAppButton from './components/WhatsAppButton.tsx';
import NotificationCenter from './components/NotificationCenter.tsx';

import {
  Award,
  LayoutDashboard,
  Calendar,
  Image,
  Ticket,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Lock,
  Menu,
  X,
  LogOut,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';

type Page =
  | 'inicio'
  | 'reservas'
  | 'promotions'
  | 'gallery'
  | 'opiniones'
  | 'contacto'
  | 'privacy'
  // Admin pages
  | 'admin-dashboard'
  | 'admin-reservations'
  | 'admin-gallery'
  | 'admin-promotions'
  | 'admin-prices'
  | 'admin-reviews';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('inicio');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Mobile nav toggles
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminAuthToggle = () => {
    if (isAdminAuthenticated) {
      // Log out
      setIsAdminAuthenticated(false);
      setCurrentPage('inicio');
    } else {
      // Prompt modal login
      setLoginError('');
      setAdminPasswordInput('');
      setShowAdminLoginModal(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput }),
      });

      if (res.ok) {
        setIsAdminAuthenticated(true);
        setShowAdminLoginModal(false);
        setAdminPasswordInput('');
        setCurrentPage('admin-dashboard'); // Jump directly into stats
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Contraseña inválida.');
      }
    } catch (err) {
      setLoginError('Error de red al autenticar.');
    }
  };

  const navigateTo = (page: Page) => {
    // Prevent unauthenticated clicks into admin space
    if (page.startsWith('admin-') && !isAdminAuthenticated) {
      setLoginError('');
      setAdminPasswordInput('');
      setShowAdminLoginModal(true);
      return;
    }
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrentAdminPage = currentPage.startsWith('admin-');

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 selection:bg-emerald-500 selection:text-black">
      {/* 1. TOP ATHLETIC HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-black/90 border-b border-zinc-900 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Club Crest Logo */}
          <div
            onClick={() => navigateTo('inicio')}
            className="flex items-center gap-2 cursor-pointer group"
            id="brand-logo-container"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-2 text-black flex items-center justify-center font-black shadow-lg shadow-emerald-500/10 group-hover:scale-105 duration-200">
              ⚽
            </div>
            <div className="text-left leading-none">
              <span className="text-base font-black text-white uppercase tracking-wider block">GOLEADA FC</span>
              <span className="text-[9px] text-emerald-400 font-mono tracking-widest block uppercase font-bold">Fútbol Rápido</span>
            </div>
          </div>

          {/* Desktop navigation */}
          {!isCurrentAdminPage && (
            <nav className="hidden md:flex items-center gap-1 text-xs uppercase font-extrabold tracking-wider">
              {([
                { id: 'inicio', label: 'Inicio' },
                { id: 'reservas', label: 'Reservas' },
                { id: 'promotions', label: 'Promociones' },
                { id: 'gallery', label: 'Galería' },
                { id: 'opiniones', label: 'Opiniones' },
                { id: 'contacto', label: 'Contacto' },
              ] as const).map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => navigateTo(menu.id)}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                    currentPage === menu.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                      : 'text-zinc-450 hover:text-white border border-transparent'
                  }`}
                >
                  {menu.label}
                </button>
              ))}
            </nav>
          )}

          {/* HEADER OPTIONS */}
          <div className="flex items-center gap-3">
            {/* Live system alerts center bell */}
            <NotificationCenter />

            {/* Administrador Switch button */}
            <button
              onClick={handleAdminAuthToggle}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] tracking-wider uppercase font-black cursor-pointer transition border border-zinc-800 ${
                isAdminAuthenticated
                  ? 'bg-rose-950/20 text-rose-400 border-rose-500/10 hover:bg-rose-900/60'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Lock size={12} className={isAdminAuthenticated ? 'text-rose-450' : 'text-zinc-600'} />
              {isAdminAuthenticated ? 'Salir Admin' : 'Panel Admin'}
            </button>

            {/* Mobile Nav Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-full p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 transition focus:outline-none"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* MOBILE SLIDEOUT MENU */}
        {mobileMenuOpen && !isCurrentAdminPage && (
          <div className="md:hidden border-t border-zinc-900 bg-black animate-in slide-in-from-top duration-250 py-4 px-3 space-y-2">
            {([
              { id: 'inicio', label: 'Inicio' },
              { id: 'reservas', label: 'Reservar Cancha' },
              { id: 'promotions', label: 'Promociones' },
              { id: 'gallery', label: 'Galería Fotos' },
              { id: 'opiniones', label: 'Opiniones' },
              { id: 'contacto', label: 'Contacto' },
            ] as const).map((menu) => (
              <button
                key={menu.id}
                onClick={() => navigateTo(menu.id)}
                className={`w-full text-left px-4 py-3 rounded-xl block text-xs uppercase font-extrabold tracking-wider ${
                  currentPage === menu.id ? 'bg-emerald-500 text-black font-black' : 'text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                {menu.label}
              </button>
            ))}
            
            <button
              onClick={handleAdminAuthToggle}
              className={`w-full text-left px-4 py-3 rounded-xl block text-xs uppercase font-extrabold tracking-wider border border-zinc-805 ${
                isAdminAuthenticated ? 'bg-rose-950/30 text-rose-400 border-rose-500/10' : 'bg-zinc-950 text-zinc-450 hover:bg-zinc-900'
              }`}
            >
              🔑 {isAdminAuthenticated ? 'Cerrar Sesión Admin' : 'Iniciar Sesión Admin'}
            </button>
          </div>
        )}
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* CHECK IF IN ADMIN DASHBOARD OVERVIEW PANEL */}
        {isCurrentAdminPage ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="admin-panel-layout">
            
            {/* Sidebar columns (Fase 3: Crear layout de sidebar para admin) */}
            <aside className="lg:col-span-1 space-y-4">
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-xl text-left space-y-4">
                <span className="text-[9px] uppercase font-black text-emerald-400 tracking-widest block border-b border-zinc-900 pb-2.5">
                  🛡️ PANEL COORD. ADMINISTRACIÓN
                </span>

                <nav className="space-y-1 text-xs font-bold font-sans">
                  {([
                    { id: 'admin-dashboard', label: 'Estadísticas', icon: <LayoutDashboard size={14} /> },
                    { id: 'admin-reservations', label: 'Verificar Reservas', icon: <Calendar size={14} /> },
                    { id: 'admin-gallery', label: 'Cargar Fotos', icon: <Image size={14} /> },
                    { id: 'admin-promotions', label: 'Administrar Promos', icon: <Ticket size={14} /> },
                    { id: 'admin-prices', label: 'Configurar Tarifas', icon: <DollarSign size={14} /> },
                    { id: 'admin-reviews', label: 'Moderar Opiniones', icon: <MessageSquare size={14} /> },
                  ] as const).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => navigateTo(sub.id)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                        currentPage === sub.id
                          ? 'bg-emerald-500 text-black font-black shadow shadow-emerald-500/10 scale-95 duration-100'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      {sub.icon} {sub.label}
                    </button>
                  ))}
                </nav>

                <div className="border-t border-zinc-900 pt-3">
                  <button
                    onClick={() => {
                      setIsAdminAuthenticated(false);
                      setCurrentPage('inicio');
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-2.5 text-rose-400 hover:bg-rose-950/25 transition font-extrabold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    <LogOut size={14} /> Salir Panel
                  </button>
                </div>
              </div>

              {/* Server indicator box */}
              <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-2xl text-[10px] text-zinc-550 space-y-1 text-left font-mono leading-relaxed">
                <span>📍 ESTADO DE ENLACE: ACTIVO</span>
                <p>Base de datos relacional SQLite inicializada con éxito. Se aplican auto-migraciones de esquemas SQL vigentes.</p>
              </div>
            </aside>

            {/* Admin views renderer */}
            <div className="lg:col-span-3 space-y-6">
              {currentPage === 'admin-dashboard' && <AdminDashboard />}
              {currentPage === 'admin-reservations' && <AdminReservations />}
              {currentPage === 'admin-gallery' && <AdminGallery />}
              {currentPage === 'admin-promotions' && <AdminPromotions />}
              {currentPage === 'admin-prices' && <AdminPrices />}
              {currentPage === 'admin-reviews' && <AdminReviews />}
            </div>

          </div>
        ) : (
          /* STANDARD GUESTS VIEW PANEL RENDERER */
          <div className="space-y-6">
            {currentPage === 'inicio' && <Home onNavigate={(p) => navigateTo(p as Page)} />}
            {currentPage === 'reservas' && <Reservations />}
            {currentPage === 'promotions' && <Promotions />}
            {currentPage === 'gallery' && <Gallery />}
            {currentPage === 'opiniones' && <Reviews />}
            {currentPage === 'contacto' && <Contact />}
            {currentPage === 'privacy' && <Privacy />}
          </div>
        )}

      </main>

      {/* 3. CORE PUBLIC FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-12 text-xs text-zinc-500 font-sans mt-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-1 text-white font-extrabold tracking-wider">
              🏟️ GOLEADA FC
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-550">
              Complejo deportivo de primer nivel. Juega con los mejores domos, pasto certificado e iluminación profesional LED en canchas de fútbol rápido.
            </p>
            <p className="text-[10px] text-zinc-600 font-mono">© 2026 Goleada FC S.A. Reservados los derechos.</p>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white uppercase text-[10px] tracking-widest block text-zinc-400">Mapa de Sitio</span>
            <ul className="space-y-1.5 leading-none">
              <li><button onClick={() => navigateTo('inicio')} className="hover:text-emerald-400 cursor-pointer">Inicio</button></li>
              <li><button onClick={() => navigateTo('reservas')} className="hover:text-emerald-400 cursor-pointer">Reservar Cancha</button></li>
              <li><button onClick={() => navigateTo('promotions')} className="hover:text-emerald-400 cursor-pointer">Promociones Activas</button></li>
              <li><button onClick={() => navigateTo('gallery')} className="hover:text-emerald-400 cursor-pointer">Galería Visual</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white uppercase text-[10px] tracking-widest block text-zinc-400">Soporte Legal</span>
            <ul className="space-y-1.5 leading-none">
              <li><button onClick={() => navigateTo('contacto')} className="hover:text-emerald-400 cursor-pointer">Formulario de Contacto</button></li>
              <li><button onClick={() => navigateTo('opiniones')} className="hover:text-emerald-400 cursor-pointer">Opiniones de Clientes</button></li>
              <li><button onClick={() => navigateTo('privacy')} className="hover:text-emerald-400 cursor-pointer">Condiciones y Privacidad</button></li>
            </ul>
          </div>

          <div className="space-y-3 text-[11px] leading-relaxed text-zinc-500 font-sans">
            <span className="font-bold text-white uppercase text-[10px] tracking-widest block text-zinc-400 font-sans">Ubicación Complejo</span>
            <p className="flex items-start gap-1.5">
              <MapPin size={14} className="text-emerald-500 mt-0.5 shrink-0" />
              <span>Av. de los Campeones Col. Estadio CDMX, México</span>
            </p>
            <p className="font-mono text-[9px] text-zinc-600">Sincronizado vía AI Studio Build™ Containers</p>
          </div>

        </div>
      </footer>

      {/* UNIVERSAL FLOATING WHATSAPP DIALOG CHAT WIDGET */}
      <WhatsAppButton />

      {/* =========================================
         4. SECURE ROUTE LOGIN MODAL (ADMIN PASSWORD)
         ========================================= */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" id="admin-login-modal">
          <div className="relative max-w-sm w-full bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl text-left space-y-4">
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-white">
                <div className="h-8 w-8 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded-xl">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide">Acceso Protegido</h3>
                  <p className="text-[10px] text-zinc-550">Solo para personal autorizado del deportivo.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminLoginModal(false)}
                className="p-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 block font-semibold">Introduce la contraseña de acceso:</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-805 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500 font-mono text-center tracking-widest font-bold"
                  required
                />
                
                {/* Visual developer tool alert helper */}
                <p className="text-[10px] text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2.5 py-2 rounded-xl mt-1.5 leading-relaxed">
                  💡 Tip de prueba: La contraseña por defecto para este prototipo sandbox es <strong className="font-mono text-white">admin123</strong>.
                </p>
              </div>

              {loginError && (
                <p className="text-[10px] text-rose-450 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg text-center">
                  ⚠️ {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-450 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Autenticar Administrador
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
