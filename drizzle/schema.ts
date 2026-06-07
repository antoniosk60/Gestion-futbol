import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const courts = sqliteTable('courts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  surface: text('surface').notNull(), // e.g. "Pasto Sintético", "Alfombra"
  capacity: text('capacity').notNull(), // e.g. "Fútbol 5", "Fútbol 7"
  hourlyRate: real('hourly_rate').notNull(),
  imageUrl: text('image_url').notNull(),
  active: integer('active').default(1).notNull(), // 1 = true, 0 = false
});

export const reservations = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courtId: integer('court_id').references(() => courts.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  clientName: text('client_name').notNull(),
  clientPhone: text('client_phone').notNull(),
  clientEmail: text('client_email').notNull(),
  totalPrice: real('total_price').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'confirmed', 'cancelled'
  paymentStatus: text('payment_status').default('unpaid').notNull(), // 'unpaid', 'paid'
  paymentIntentId: text('payment_intent_id'),
  createdAt: text('created_at').notNull(), // ISO Date
});

export const promotions = sqliteTable('promotions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  discountType: text('discount_type').notNull(), // 'percentage', 'fixed'
  discountValue: real('discount_value').notNull(),
  code: text('code').notNull(),
  startDate: text('start_date').notNull(), // YYYY-MM-DD
  endDate: text('end_date').notNull(), // YYYY-MM-DD
  imageUrl: text('image_url'),
  active: integer('active').default(1).notNull(), // 1 = true, 0 = false
});

export const gallery = sqliteTable('gallery', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  category: text('category').notNull(), // 'canchas', 'eventos', 'instalaciones'
  description: text('description'),
  createdAt: text('created_at').notNull(), // ISO Date
});

export const prices = sqliteTable('prices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courtId: integer('court_id').references(() => courts.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, etc.
  startHour: text('start_hour').notNull(), // HH:MM
  endHour: text('end_hour').notNull(), // HH:MM
  rate: real('rate').notNull(), // Special hourly rate for this peak / off-peak time
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  message: text('message').notNull(),
  type: text('type').default('info').notNull(), // 'new_reservation', 'payment_confirmed', 'reminder', 'info'
  read: integer('read').default(0).notNull(), // 0 = false, 1 = true
  createdAt: text('created_at').notNull(), // ISO Date
});

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorName: text('author_name').notNull(),
  rating: integer('rating').notNull(), // 1 to 5
  comment: text('comment').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  approved: integer('approved').default(0).notNull(), // 0 = pending, 1 = approved
});
