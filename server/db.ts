import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../drizzle/schema.ts';

// Initialize SQLite database
export const sqlite = new Database('data.db');

// Ensure tables are created immediately and robustly.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS courts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    surface TEXT NOT NULL,
    capacity TEXT NOT NULL,
    hourly_rate REAL NOT NULL,
    image_url TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    court_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    payment_intent_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    code TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    image_url TEXT,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    court_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_hour TEXT NOT NULL,
    end_hour TEXT NOT NULL,
    rate REAL NOT NULL,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    date TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0
  );
`);

export const db = drizzle(sqlite, { schema });

// Seed initial data if the database is empty
const seedDatabase = () => {
  // Check if courts table is empty
  const courtsCount = sqlite.prepare('SELECT count(*) as count FROM courts').get() as { count: number };
  
  if (courtsCount.count === 0) {
    console.log('Seeding initial soccer data...');
    
    // Seed Courts
    const insertCourt = sqlite.prepare(`
      INSERT INTO courts (name, description, surface, capacity, hourly_rate, image_url, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertCourt.run(
      'Cancha Camp Nou',
      'Cancha profesional al aire libre con pasto sintético monofilamento de última generación y sistema de drenaje pluvial rápido.',
      'Sintético premium',
      'Fútbol 7',
      850.0,
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
      1
    );
    
    insertCourt.run(
      'Cancha San Siro (Techada)',
      'Ideal para jugar sin preocuparse por el clima. Domo techado con excelente ventilación, iluminación LED de alta potencia y pasto sintético suave.',
      'Alfombra sintética',
      'Fútbol 5',
      700.0,
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop',
      1
    );

    insertCourt.run(
      'Cancha Bombonera',
      'Cancha cerrada con gradas laterales, perfecta para torneos intensos de fútbol rápido con paredes activas para juego dinámico.',
      'Sintético clásico',
      'Fútbol 6',
      750.0,
      'https://images.unsplash.com/photo-1575361204480-aadea25597fc?q=80&w=600&auto=format&fit=crop',
      1
    );

    // Seed Promotions
    const insertPromo = sqlite.prepare(`
      INSERT INTO promotions (title, description, discount_type, discount_value, code, start_date, end_date, image_url, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertPromo.run(
      'Lunes Locos de Goleada',
      'Inicia la semana con un descuentazo del 20% en cualquiera de nuestras canchas reservando en horario matutino o vespertino.',
      'percentage',
      20.0,
      'LUNES20',
      '2026-06-01',
      '2026-12-31',
      'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=600&auto=format&fit=crop',
      1
    );

    insertPromo.run(
      'Descuento Mañanero (Early Bird)',
      '¿Partidito temprano? Obtén 150 MXN de descuento directo en reservas antes de la 1 PM.',
      'fixed',
      150.0,
      'EARLYCARD',
      '2026-06-01',
      '2026-12-31',
      'https://images.unsplash.com/photo-1431324155629-1a6edd1dec1d?q=80&w=600&auto=format&fit=crop',
      1
    );

    // Seed Gallery Images
    const insertGallery = sqlite.prepare(`
      INSERT INTO gallery (title, image_url, category, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertGallery.run(
      'Inauguración de la Cancha Techada',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
      'instalaciones',
      'Evento con patrocinadores e iluminación de noche lista.',
      new Date().toISOString()
    );

    insertGallery.run(
      'Final de Torneo de Copa Semanal',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop',
      'eventos',
      'Gran partido lleno de goles en cancha de fútbol 7.',
      new Date().toISOString()
    );

    insertGallery.run(
      'Clínica de Fútbol Infantil de Verano',
      'https://images.unsplash.com/photo-1431324155629-1a6edd1dec1d?q=80&w=600&auto=format&fit=crop',
      'instalaciones',
      'Entrenamientos formativos para nuevas promesas del balón.',
      new Date().toISOString()
    );

    // Seed Special Price Rules
    const insertPrice = sqlite.prepare(`
      INSERT INTO prices (court_id, day_of_week, start_hour, end_hour, rate)
      VALUES (?, ?, ?, ?, ?)
    `);

    // High peak rates for Camp Nou (1) after 18:00 (6 PM) to 23:00 (11 PM) on weekdays (Monday to Friday, 1-5)
    for (let day = 1; day <= 5; day++) {
      insertPrice.run(1, day, '18:00', '23:00', 950.0);
      insertPrice.run(2, day, '18:00', '23:00', 800.0);
    }

    // Seed Notifications
    const insertNotification = sqlite.prepare(`
      INSERT INTO notifications (message, type, read, created_at)
      VALUES (?, ?, ?, ?)
    `);

    insertNotification.run('¡La plataforma de Gestión de Canchas ha sido creada con éxito!', 'info', 0, new Date().toISOString());
    insertNotification.run('¡Se agregaron canchas, promociones y galería para la inauguración oficial!', 'info', 0, new Date().toISOString());

    // Seed Reviews
    const insertReview = sqlite.prepare(`
      INSERT INTO reviews (author_name, rating, comment, date, approved)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertReview.run('Andrés Mendoza', 5, '¡El pasto sintético está impecable! No genera quemaduras en las caídas y la iluminación LED es ideal para partidos a las 9 PM.', '2026-06-05', 1);
    insertReview.run('Karla Esquivel', 5, 'Súper amigables las reservas y muy accesible el estacionamiento. La cancha techada es súper cómoda en tiempo de lluvias.', '2026-06-06', 1);
    insertReview.run('Rodrigo Huerta', 4, 'Excelente ambiente, vestidores súper limpios y buen precio en las promociones EARLYBIRD.', '2026-06-07', 1);
  }
};

seedDatabase();
