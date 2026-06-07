import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { z } from 'zod';
import { db, sqlite } from './server/db.ts';
import {
  courts,
  reservations,
  promotions,
  gallery,
  prices,
  notifications,
  reviews,
} from './drizzle/schema.ts';
import { eq, and, or, like, desc } from 'drizzle-orm';
import { createStripePaymentIntent } from './server/_core/stripe.ts';
import { uploadImage, deleteImage } from './server/storage.ts';

// ESM path compatibility wrapper for both dev (ESM) and prod (CJS) environments
let currentDirname = '';
try {
  const filename = fileURLToPath(import.meta.url);
  currentDirname = path.dirname(filename);
} catch (err) {
  currentDirname = __dirname;
}

const app = express();
const PORT = 3000;

// High limits for base64 gallery uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to calculate hours between two "HH:MM" times
function calculateHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startDec = sh + sm / 60;
  const endDec = eh + em / 60;
  return Math.max(0, endDec - startDec);
}

// Check for booking collision/overlaps (start1 < end2 AND start2 < end1)
function checkTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

// Custom function to calculate booking rate based on pricing rules and active promotions
function calculateBookingPrice(
  courtRate: number,
  specialRules: any[],
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  promo: any | null
): { basePrice: number; discountedPrice: number; discountValue: number } {
  const hours = calculateHours(startTime, endTime);
  
  // See if any special rate matches this day of the week and timescale
  let applicableRate = courtRate;
  for (const rule of specialRules) {
    if (
      rule.dayOfWeek === dayOfWeek &&
      checkTimeOverlap(startTime, endTime, rule.startHour, rule.endHour)
    ) {
      applicableRate = rule.rate;
      break;
    }
  }

  const basePrice = applicableRate * hours;
  let discountedPrice = basePrice;
  let discountValue = 0;

  if (promo) {
    if (promo.discountType === 'percentage') {
      discountValue = (basePrice * promo.discountValue) / 100;
      discountedPrice = Math.max(0, basePrice - discountValue);
    } else if (promo.discountType === 'fixed') {
      discountValue = promo.discountValue;
      discountedPrice = Math.max(0, basePrice - discountValue);
    }
  }

  return {
    basePrice,
    discountedPrice,
    discountValue,
  };
}

// ==========================================
// API ROUTERS & CONTROLLERS
// ==========================================

// Authenticate administrator
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const envPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === envPassword) {
    return res.json({ success: true, token: 'session_admin_verified_token_2026' });
  }
  return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
});

// --- COURTS API ---
app.get('/api/courts', (req, res) => {
  try {
    const allCourts = db.select().from(courts).all();
    res.json(allCourts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courts', (req, res) => {
  try {
    const courtSchema = z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      surface: z.string().min(1),
      capacity: z.string().min(1),
      hourlyRate: z.number().positive(),
      imageUrl: z.string().min(1),
    });

    const parsed = courtSchema.parse(req.body);
    const newCourt = db.insert(courts).values({
      name: parsed.name,
      description: parsed.description,
      surface: parsed.surface,
      capacity: parsed.capacity,
      hourlyRate: parsed.hourlyRate,
      imageUrl: parsed.imageUrl,
      active: 1,
    }).returning().get();

    res.status(201).json(newCourt);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/courts/:id', (req, res) => {
  try {
    const courtId = parseInt(req.params.id);
    const courtSchema = z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      surface: z.string().min(1),
      capacity: z.string().min(1),
      hourlyRate: z.number().positive(),
      imageUrl: z.string().min(1),
      active: z.number(),
    });

    const parsed = courtSchema.parse(req.body);
    db.update(courts)
      .set(parsed)
      .where(eq(courts.id, courtId))
      .run();

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- SPECIAL PRICING RULES ---
app.get('/api/admin/prices', (req, res) => {
  try {
    const allPrices = db.select().from(prices).all();
    res.json(allPrices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/prices', (req, res) => {
  try {
    const priceSchema = z.object({
      courtId: z.number(),
      dayOfWeek: z.number().min(0).max(6),
      startHour: z.string(),
      endHour: z.string(),
      rate: z.number().positive(),
    });

    const parsed = priceSchema.parse(req.body);
    const newPrice = db.insert(prices).values({
      courtId: parsed.courtId,
      dayOfWeek: parsed.dayOfWeek,
      startHour: parsed.startHour,
      endHour: parsed.endHour,
      rate: parsed.rate,
    }).returning().get();

    res.status(201).json(newPrice);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/prices/:id', (req, res) => {
  try {
    const priceId = parseInt(req.params.id);
    db.delete(prices).where(eq(prices.id, priceId)).run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- RESERVATIONS API ---
app.get('/api/reservations', (req, res) => {
  try {
    const allReservations = db.select().from(reservations).all();
    res.json(allReservations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reservations/availability', (req, res) => {
  try {
    const date = req.query.date as string; // YYYY-MM-DD
    const courtId = parseInt(req.query.courtId as string);

    if (!date || isNaN(courtId)) {
      return res.status(400).json({ error: 'Falta la fecha o el ID de la cancha' });
    }

    const matched = db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.date, date),
          eq(reservations.courtId, courtId),
          or(eq(reservations.status, 'confirmed'), eq(reservations.status, 'pending'))
        )
      )
      .all();

    res.json(matched.map((r) => ({ startTime: r.startTime, endTime: r.endTime })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations', (req, res) => {
  try {
    const resSchema = z.object({
      courtId: z.number(),
      date: z.string(), // YYYY-MM-DD
      startTime: z.string(), // HH:MM
      endTime: z.string(), // HH:MM
      clientName: z.string().min(1),
      clientPhone: z.string().min(1),
      clientEmail: z.string().email(),
      promoCode: z.string().optional(),
    });

    const parsed = resSchema.parse(req.body);

    // 1. Detect collision
    const overlaps = db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.date, parsed.date),
          eq(reservations.courtId, parsed.courtId),
          or(eq(reservations.status, 'confirmed'), eq(reservations.status, 'pending'))
        )
      )
      .all();

    for (const overlap of overlaps) {
      if (checkTimeOverlap(parsed.startTime, parsed.endTime, overlap.startTime, overlap.endTime)) {
        return res.status(409).json({ error: 'Este horario ya está reservado' });
      }
    }

    // 2. Fetch court rates
    const court = db.select().from(courts).where(eq(courts.id, parsed.courtId)).get();
    if (!court) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }

    // Determine day of the week
    const dateObj = new Date(parsed.date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // Fetch special pricing rules for this court
    const courtPrices = db.select().from(prices).where(eq(prices.courtId, parsed.courtId)).all();

    // Fetch promotion code if applied
    let activePromo: any = null;
    if (parsed.promoCode) {
      activePromo = db
        .select()
        .from(promotions)
        .where(and(eq(promotions.code, parsed.promoCode.toUpperCase()), eq(promotions.active, 1)))
        .get();
    }

    // Calculate dynamic pricing
    const priceCalculation = calculateBookingPrice(
      court.hourlyRate,
      courtPrices,
      dayOfWeek,
      parsed.startTime,
      parsed.endTime,
      activePromo
    );

    // 3. Create the database record as 'pending'
    const finalReservation = db
      .insert(reservations)
      .values({
        courtId: parsed.courtId,
        date: parsed.date,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        clientName: parsed.clientName,
        clientPhone: parsed.clientPhone,
        clientEmail: parsed.clientEmail,
        totalPrice: priceCalculation.discountedPrice,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();

    // Create Notification and register log
    db.insert(notifications).values({
      message: `¡Nueva reserva pendiente! ${parsed.clientName} ha agendado la ${court.name} para el ${parsed.date} de ${parsed.startTime} a ${parsed.endTime}.`,
      type: 'new_reservation',
      read: 0,
      createdAt: new Date().toISOString(),
    }).run();

    res.status(201).json({
      reservation: finalReservation,
      pricing: priceCalculation,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/reservations/:id', (req, res) => {
  try {
    const resId = parseInt(req.params.id);
    const updateSchema = z.object({
      status: z.enum(['pending', 'confirmed', 'cancelled']),
      paymentStatus: z.enum(['unpaid', 'paid']),
      clientName: z.string().optional(),
      clientPhone: z.string().optional(),
      clientEmail: z.string().optional(),
    });

    const parsed = updateSchema.parse(req.body);
    db.update(reservations)
      .set(parsed)
      .where(eq(reservations.id, resId))
      .run();

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- PROMOTIONS API ---
app.get('/api/promotions', (req, res) => {
  try {
    const promos = db.select().from(promotions).all();
    res.json(promos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promotions', (req, res) => {
  try {
    const promoSchema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      discountType: z.enum(['percentage', 'fixed']),
      discountValue: z.number().positive(),
      code: z.string().min(1),
      startDate: z.string(),
      endDate: z.string(),
      imageUrl: z.string().optional(),
    });

    const parsed = promoSchema.parse(req.body);
    const newPromo = db.insert(promotions).values({
      title: parsed.title,
      description: parsed.description,
      discountType: parsed.discountType,
      discountValue: parsed.discountValue,
      code: parsed.code.toUpperCase(),
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      imageUrl: parsed.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop',
      active: 1,
    }).returning().get();

    res.status(201).json(newPromo);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/promotions/:id', (req, res) => {
  try {
    const promoId = parseInt(req.params.id);
    const promoSchema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      discountType: z.enum(['percentage', 'fixed']),
      discountValue: z.number().positive(),
      code: z.string().min(1),
      startDate: z.string(),
      endDate: z.string(),
      imageUrl: z.string().optional(),
      active: z.number(),
    });

    const parsed = promoSchema.parse(req.body);
    db.update(promotions)
      .set({
        ...parsed,
        code: parsed.code.toUpperCase(),
      })
      .where(eq(promotions.id, promoId))
      .run();

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/promotions/:id', (req, res) => {
  try {
    const promoId = parseInt(req.params.id);
    db.delete(promotions).where(eq(promotions.id, promoId)).run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- GALLERY API ---
app.get('/api/gallery', (req, res) => {
  try {
    const category = req.query.category as string;
    let images;
    if (category && category !== 'todos') {
      images = db.select().from(gallery).where(eq(gallery.category, category)).all();
    } else {
      images = db.select().from(gallery).all();
    }
    res.json(images);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gallery', async (req, res) => {
  try {
    const itemSchema = z.object({
      title: z.string().min(1),
      imageFileBase64: z.string().min(1), // Base64 encoding
      category: z.string().min(1), // 'canchas', 'eventos', 'instalaciones', etc.
      description: z.string().optional(),
    });

    const parsed = itemSchema.parse(req.body);
    
    // Upload image to S3 or secure local base64 fallback
    const secureUrl = await uploadImage(parsed.imageFileBase64, parsed.title, parsed.category);

    const newItem = db
      .insert(gallery)
      .values({
        title: parsed.title,
        imageUrl: secureUrl,
        category: parsed.category,
        description: parsed.description || '',
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();

    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = db.select().from(gallery).where(eq(gallery.id, id)).get();
    
    if (item) {
      // Safely delete from S3 or local fallback
      await deleteImage(item.imageUrl);
      db.delete(gallery).where(eq(gallery.id, id)).run();
    }
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTIFICATIONS API ---
app.get('/api/notifications', (req, res) => {
  try {
    const items = db.select().from(notifications).orderBy(desc(notifications.id)).all();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', (req, res) => {
  try {
    const notId = parseInt(req.params.id);
    db.update(notifications)
      .set({ read: 1 })
      .where(eq(notifications.id, notId))
      .run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/clear', (req, res) => {
  try {
    db.update(notifications).set({ read: 1 }).run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CUSTOMERS REVIEWS API ---
app.get('/api/reviews', (req, res) => {
  try {
    const showAll = req.query.all === 'true'; // Admin list
    let list;
    if (showAll) {
      list = db.select().from(reviews).orderBy(desc(reviews.id)).all();
    } else {
      list = db.select().from(reviews).where(eq(reviews.approved, 1)).orderBy(desc(reviews.id)).all();
    }
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const reviewSchema = z.object({
      authorName: z.string().min(1),
      rating: z.number().min(1).max(5),
      comment: z.string().min(1),
    });

    const parsed = reviewSchema.parse(req.body);
    const newRev = db.insert(reviews).values({
      authorName: parsed.authorName,
      rating: parsed.rating,
      comment: parsed.comment,
      date: new Date().toISOString().split('T')[0],
      approved: 0, // Needs admin approval to avoid spam
    }).returning().get();

    // Notify administrators of a new review submitted
    db.insert(notifications).values({
      message: `Nueva reseña enviada por ${parsed.authorName} (${parsed.rating}/5 estrellas). Requiere aprobación del administrador.`,
      type: 'info',
      read: 0,
      createdAt: new Date().toISOString(),
    }).run();

    res.status(201).json(newRev);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/reviews/:id/approve', (req, res) => {
  try {
    const revId = parseInt(req.params.id);
    const { approved } = req.body; // 1 or 0
    db.update(reviews)
      .set({ approved: approved ? 1 : 0 })
      .where(eq(reviews.id, revId))
      .run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', (req, res) => {
  try {
    const revId = parseInt(req.params.id);
    db.delete(reviews).where(eq(reviews.id, revId)).run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- STRIPE PAYMENTS API ---
app.post('/api/payments/intent', async (req, res) => {
  try {
    const schemaIntent = z.object({
      reservationId: z.number(),
      amount: z.number().positive(),
    });

    const parsed = schemaIntent.parse(req.body);

    // Fetch the reservation to see if it exists
    const reservation = db.select().from(reservations).where(eq(reservations.id, parsed.reservationId)).get();
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const paymentIntent = await createStripePaymentIntent(parsed.amount, 'mxn', {
      reservationId: parsed.reservationId.toString(),
      clientName: reservation.clientName,
      clientEmail: reservation.clientEmail,
    });

    // Update reservation with payment intent id
    db.update(reservations)
      .set({ paymentIntentId: paymentIntent.id })
      .where(eq(reservations.id, parsed.reservationId))
      .run();

    res.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      isCustomMock: paymentIntent.isCustomMock,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/payments/confirm', (req, res) => {
  try {
    const schemaConfirm = z.object({
      reservationId: z.number(),
      paymentIntentId: z.string(),
    });

    const parsed = schemaConfirm.parse(req.body);

    // Update state
    db.update(reservations)
      .set({
        status: 'confirmed',
        paymentStatus: 'paid',
      })
      .where(eq(reservations.id, parsed.reservationId))
      .run();

    // Fetch details
    const r = db.select().from(reservations).where(eq(reservations.id, parsed.reservationId)).get();
    const courtName = r 
      ? (db.select().from(courts).where(eq(courts.id, r.courtId)).get()?.name || 'la cancha')
      : 'la cancha';

    // Log notification
    db.insert(notifications).values({
      message: `¡Pago confirmado para reserva #${parsed.reservationId}! ${r?.clientName} ha pagado ${r?.totalPrice} MXN por la ${courtName} el ${r?.date}.`,
      type: 'payment_confirmed',
      read: 0,
      createdAt: new Date().toISOString(),
    }).run();

    res.json({ success: true, message: 'Pago de reserva confirmado correctamente.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Optional webhook listener for Stripe
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // Let it return a basic ok response, we've confirmed payments directly on the API.
  res.json({ received: true });
});

// --- ADMIN STATISTICAL DASHBOARD ---
app.get('/api/admin/stats', (req, res) => {
  try {
    const allRes = db.select().from(reservations).all();
    const allCourts = db.select().from(courts).all();
    const allPromos = db.select().from(promotions).all();
    
    // Revenue calculations
    const totalEarnings = allRes
      .filter((r) => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + r.totalPrice, 0);

    const totalBookings = allRes.length;
    const confirmedCount = allRes.filter((r) => r.status === 'confirmed').length;
    const pendingCount = allRes.filter((r) => r.status === 'pending').length;
    const cancelledCount = allRes.filter((r) => r.status === 'cancelled').length;

    // Direct distribution list per court
    const courtStats = allCourts.map((c) => {
      const courtRes = allRes.filter((r) => r.courtId === c.id && r.status !== 'cancelled');
      const earnings = courtRes
        .filter((r) => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + r.totalPrice, 0);
      return {
        id: c.id,
        name: c.name,
        bookingCount: courtRes.length,
        earnings,
      };
    });

    // Occupancy graph: divide reservations per day of week
    const weekdayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const weekdayOccupancyByDay = [0, 0, 0, 0, 0, 0, 0];
    
    allRes.forEach((r) => {
      if (r.status !== 'cancelled') {
        const d = new Date(r.date + 'T00:00:00');
        weekdayOccupancyByDay[d.getDay()] += 1;
      }
    });

    const occupancyData = weekdayNames.map((name, index) => ({
      day: name,
      reservations: weekdayOccupancyByDay[index],
    }));

    res.json({
      totalEarnings,
      totalBookings,
      confirmedCount,
      pendingCount,
      cancelledCount,
      activeCourtsCount: allCourts.filter(c => c.active === 1).length,
      activePromosCount: allPromos.filter(p => p.active === 1).length,
      courtStats,
      occupancyData,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Contact and support log helper (Fase 8: Formulario de contacto funcional)
app.post('/api/contact', (req, res) => {
  try {
    const contactSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      subject: z.string().min(1),
      message: z.string().min(1),
    });

    const parsed = contactSchema.parse(req.body);

    db.insert(notifications).values({
      message: `¡Nuevo mensaje de contacto de ${parsed.name} (${parsed.email}) - Asunto: ${parsed.subject}. Mensaje: "${parsed.message}"`,
      type: 'info',
      read: 0,
      createdAt: new Date().toISOString(),
    }).run();

    res.json({ success: true, message: 'Su mensaje ha sido enviado satisfactoriamente al administrador.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// AUTOMATED SYSTEM NOTIFICATIONS REMINDERS
// ==========================================
// Automatically runs reminders every 30 minutes in the background (simulated cron heartbeat)
// To notify the client or record logs about reservations matching ~24 hours from today
setInterval(() => {
  try {
    const now = new Date();
    const targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dateString = targetDate.toISOString().split('T')[0];

    // Query un-reminded reservations matching the date
    const tomorrowsBookings = db
      .select()
      .from(reservations)
      .where(and(eq(reservations.date, dateString), eq(reservations.status, 'confirmed')))
      .all();

    tomorrowsBookings.forEach((b) => {
      // Create reminder alert if not done or simulation mock
      console.log(`[HEARTBEAT REMINDER] Generando recordatorio para la reserva #${b.id} de ${b.clientName} programada para mañana.`);
      
      const count = sqlite.prepare('SELECT count(*) as count FROM notifications WHERE message LIKE ?').get(`%recordatorio automático para la reserva #${b.id}%`) as { count: number };
      if (count.count === 0) {
        db.insert(notifications).values({
          message: `⏰ Recordatorio automático para la reserva #${b.id}: ${b.clientName} tiene agendada la cancha mañana el ${b.date} a las ${b.startTime}. Correo de contacto: ${b.clientEmail}.`,
          type: 'reminder',
          read: 0,
          createdAt: new Date().toISOString(),
        }).run();
      }
    });
  } catch (e) {
    console.error('Error ticking heartbeat scheduler:', e);
  }
}, 30 * 60 * 1000);

// ==========================================
// STATIC FILES & PRODUCTION ROUTING
// ==========================================

// If in production, serve built frontend assets; else Vite handles it on Dev server
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(currentDirname, 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res, next) => {
    // Skip /api requests
    if (req.path.startsWith('/api')) {
      return next();
    }
    const htmlFile = path.join(distPath, 'index.html');
    if (fs.existsSync(htmlFile)) {
      res.sendFile(htmlFile);
    } else {
      res.status(404).send('Build assets not found yet. Run compile_applet.');
    }
  });
} else {
  // Return helpful dev warning for root API hits
  app.get('/', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.send('Dev mode. Vite dev server handles client assets. Query APIs directly.');
  });
}

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Excepción interna de servidor.' });
});

// Run server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ FULL STACK SERVER ESCUCHANDO EN EL PUERTO ${PORT} ✨`);
});
