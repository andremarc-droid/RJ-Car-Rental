export type CarStatus = 'available' | 'unavailable' | 'maintenance' | 'rented';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type Transmission = 'automatic' | 'manual';

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: Transmission;
  fuel_type: string;
  seats: number;
  daily_rate: number;
  status: CarStatus;
  image_url?: string;
  description?: string;
  available_from?: string | null;
  available_until?: string | null;
  createdAt?: unknown;
}

export interface Booking {
  id: string;
  car_id: string;
  car_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  userId?: string;
  createdAt?: unknown;
  payment_option?: 'full' | 'downpayment';
  gcash_number?: string;
  gcash_reference?: string;
  gcash_screenshot?: string;
  payment_amount?: number;
  payment_submitted_at?: string;
}

export interface Review {
  id: string;
  car_id: string;
  user_name: string;
  rating: number;
  comment: string;
  createdAt?: unknown;
}

export interface ChatThread {
  id: string;
  userId: string;
  userName: string;
  lastMessage?: string;
  updatedAt?: unknown;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt?: unknown;
}

export interface CarFormData {
  brand: string;
  model: string;
  year: number;
  category: string;
  seats: number;
  transmission: Transmission;
  fuel_type: string;
  daily_rate: number;
  status: CarStatus;
  available_from: string;
  available_until: string;
  description: string;
  image_url?: string;
}

export const BOOKING_ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'active'];

export const CAR_CATEGORIES = [
  'Sedan', 'SUV', 'Hatchback', 'MPV', 'Pickup', 'Van', 'Luxury', 'Sports', 'Electric',
];

export const FUEL_TYPES = ['Gasoline', 'Diesel', 'Hybrid', 'Electric'];
