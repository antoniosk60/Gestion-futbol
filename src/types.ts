/**
 * Tipos de datos para el sistema de Gestión de Canchas de Fútbol Rápido.
 * Basado en las tablas del modelo de base de datos provisto.
 */

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  openId?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastSignedIn?: string;
}

export type CourtStatus = 'active' | 'inactive';

export interface Court {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  maxCapacity: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id: number;
  userId: number;
  userName: string; // Para facilitar consultas de administración
  userEmail: string;
  courtId: number;
  courtName: string; // Facilitar visualización
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: number;
  reservationId: number;
  userId: number;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryPhoto {
  id: number;
  title: string;
  description: string;
  storageKey: string;
  storageUrl: string;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'reservation' | 'payment' | 'reminder' | 'promotion';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Interfaz para estadísticas de administración
export interface DashboardStats {
  totalRevenue: number;
  activeUsers: number;
  totalReservationsCount: number;
  activePromotionsCount: number;
  courtUtilization: { courtName: string; percentage: number }[];
  recentActivity: {
    id: number;
    type: 'reservation_created' | 'payment_completed' | 'reservation_cancelled' | 'new_user';
    description: string;
    timestamp: string;
  }[];
  monthlySales: { month: string; amount: number }[];
}
