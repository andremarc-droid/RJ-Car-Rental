import type { Timestamp } from 'firebase/firestore';
import type { Booking, Car, Review } from '../types';
import { BOOKING_ACTIVE_STATUSES } from '../types';

export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDisplayDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(value: unknown): string {
  if (!value) return 'Sending...';
  const date = (value as Timestamp).toDate?.() ?? new Date(value as string);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function calculateRentalDays(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || end < start) return 0;
  return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateTotalPrice(dailyRate: number, startDate: string, endDate: string): number {
  return calculateRentalDays(startDate, endDate) * dailyRate;
}

export function datesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  const startA = parseDate(aStart);
  const endA = parseDate(aEnd);
  const startB = parseDate(bStart);
  const endB = parseDate(bEnd);
  if (!startA || !endA || !startB || !endB) return false;
  return startA <= endB && endA >= startB;
}

export function isCarCurrentlyBookable(car: Car, referenceDate = new Date()): boolean {
  if (car.status !== 'available') return false;

  const today = startOfDay(referenceDate);

  if (car.available_from) {
    const from = startOfDay(parseDate(car.available_from)!);
    if (from > today) return false;
  }

  if (car.available_until) {
    const until = startOfDay(parseDate(car.available_until)!);
    if (until < today) return false;
  }

  return true;
}

export function hasFutureAvailability(car: Car, referenceDate = new Date()): boolean {
  if (!car.available_from) return false;
  const from = startOfDay(parseDate(car.available_from)!);
  return from > startOfDay(referenceDate);
}

export function isCarAvailableForDates(
  car: Car,
  startDate: string,
  endDate: string,
  bookings: Booking[],
): boolean {
  if (car.status !== 'available') return false;

  const start = startOfDay(parseDate(startDate)!);
  const end = endOfDay(parseDate(endDate)!);

  if (car.available_from) {
    const from = startOfDay(parseDate(car.available_from)!);
    if (start < from) return false;
  }

  if (car.available_until) {
    const until = endOfDay(parseDate(car.available_until)!);
    if (end > until) return false;
  }

  const overlapping = bookings.some(
    (booking) =>
      booking.car_id === car.id &&
      BOOKING_ACTIVE_STATUSES.includes(booking.status) &&
      datesOverlap(startDate, endDate, booking.start_date, booking.end_date),
  );

  return !overlapping;
}

export function getCarStatusLabel(car: Car): string {
  if (car.status === 'maintenance') return 'Maintenance';
  if (car.status !== 'available') return 'Unavailable';
  if (hasFutureAvailability(car)) return 'Coming Soon';
  if (!isCarCurrentlyBookable(car)) return 'Unavailable';
  return 'Available';
}

export function getCarImageUrl(car: Car & { image_path?: string }): string | undefined {
  return car.image_url || car.image_path;
}

export function normalizeCar(id: string, data: Record<string, unknown>): Car {
  return {
    id,
    brand: String(data.brand ?? ''),
    model: String(data.model ?? ''),
    year: Number(data.year ?? 0),
    category: String(data.category ?? ''),
    transmission: (data.transmission as Car['transmission']) ?? 'automatic',
    fuel_type: String(data.fuel_type ?? data.fuelType ?? ''),
    seats: Number(data.seats ?? 0),
    daily_rate: Number(data.daily_rate ?? data.dailyRate ?? 0),
    status: (data.status as Car['status']) ?? 'available',
    image_url: String(data.image_url ?? data.imageUrl ?? data.image_path ?? ''),
    description: String(data.description ?? ''),
    available_from: (data.available_from ?? data.availableFrom ?? null) as string | null,
    available_until: (data.available_until ?? data.availableUntil ?? null) as string | null,
    createdAt: data.createdAt,
  };
}

export function normalizeBooking(id: string, data: Record<string, unknown>): Booking {
  return {
    id,
    car_id: String(data.car_id ?? data.carId ?? ''),
    car_name: String(data.car_name ?? data.carName ?? ''),
    customer_name: String(data.customer_name ?? data.customerName ?? ''),
    customer_email: String(data.customer_email ?? data.customerEmail ?? ''),
    customer_phone: String(data.customer_phone ?? data.customerPhone ?? ''),
    start_date: String(data.start_date ?? data.startDate ?? ''),
    end_date: String(data.end_date ?? data.endDate ?? ''),
    total_price: Number(data.total_price ?? data.totalPrice ?? 0),
    status: (data.status as Booking['status']) ?? 'pending',
    userId: data.userId as string | undefined,
    createdAt: data.createdAt,
    payment_option: data.payment_option as 'full' | 'downpayment' | undefined,
    gcash_number: data.gcash_number as string | undefined,
    gcash_reference: data.gcash_reference as string | undefined,
    gcash_screenshot: data.gcash_screenshot as string | undefined,
    payment_amount: data.payment_amount as number | undefined,
    payment_submitted_at: data.payment_submitted_at as string | undefined,
  };
}

export function normalizeReview(id: string, data: Record<string, unknown>): Review {
  return {
    id,
    car_id: String(data.car_id ?? data.carId ?? ''),
    user_name: String(data.user_name ?? data.userName ?? 'Anonymous'),
    rating: Number(data.rating ?? 0),
    comment: String(data.comment ?? ''),
    createdAt: data.createdAt,
  };
}

export function bookingStatusClasses(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-50 border border-emerald-200 text-emerald-600';
    case 'pending':
      return 'bg-amber-50 border border-amber-200 text-amber-600';
    case 'active':
      return 'bg-blue-50 border border-blue-200 text-blue-600';
    case 'completed':
      return 'bg-gray-100 border border-gray-200 text-gray-600';
    case 'cancelled':
      return 'bg-rose-50 border border-rose-200 text-rose-600';
    default:
      return 'bg-gray-100 border border-gray-200 text-gray-600';
  }
}

export function carBadgeClasses(car: Car): string {
  if (car.status === 'available' && isCarCurrentlyBookable(car)) {
    return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
  }
  if (car.status === 'available' && !isCarCurrentlyBookable(car) && hasFutureAvailability(car)) {
    return 'bg-amber-50 text-amber-600 border border-amber-200';
  }
  return 'bg-rose-50 text-rose-600 border border-rose-200';
}
