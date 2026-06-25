import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Booking, Car, CarFormData } from '../types';
import { normalizeBooking, normalizeCar } from '../utils';

const carsRef = collection(db, 'cars');

export async function fetchCars(): Promise<Car[]> {
  const snapshot = await getDocs(query(carsRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => normalizeCar(d.id, d.data()));
}

export function subscribeCars(callback: (cars: Car[]) => void): Unsubscribe {
  const apply = (snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => {
    callback(snapshot.docs.map((d) => normalizeCar(d.id, d.data())));
  };

  return onSnapshot(
    query(carsRef, orderBy('createdAt', 'desc')),
    apply,
    () => onSnapshot(carsRef, apply),
  );
}

export async function fetchCarById(id: string): Promise<Car | null> {
  const snapshot = await getDoc(doc(db, 'cars', id));
  if (!snapshot.exists()) return null;
  return normalizeCar(snapshot.id, snapshot.data());
}

export function subscribeCar(id: string, callback: (car: Car | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'cars', id), (snapshot) => {
    callback(snapshot.exists() ? normalizeCar(snapshot.id, snapshot.data()) : null);
  });
}

export async function createCar(data: CarFormData): Promise<string> {
  const docRef = await addDoc(carsRef, {
    brand: data.brand,
    model: data.model,
    year: data.year,
    category: data.category,
    transmission: data.transmission,
    fuel_type: data.fuel_type,
    seats: data.seats,
    daily_rate: data.daily_rate,
    status: data.status,
    image_url: data.image_url ?? '',
    description: data.description,
    available_from: data.available_from || null,
    available_until: data.available_until || null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCar(id: string, data: Partial<CarFormData>): Promise<void> {
  const payload: Record<string, unknown> = { ...data };
  if (data.available_from === '') payload.available_from = null;
  if (data.available_until === '') payload.available_until = null;
  await updateDoc(doc(db, 'cars', id), payload);
}

export async function deleteCar(id: string): Promise<void> {
  await deleteDoc(doc(db, 'cars', id));
}

export async function fetchFeaturedCars(limit = 3): Promise<Car[]> {
  const cars = await fetchCars();
  return cars.filter((c) => c.status === 'available').slice(0, limit);
}

export async function fetchBookingsForCar(carId: string): Promise<Booking[]> {
  const snapshot = await getDocs(query(collection(db, 'bookings'), where('car_id', '==', carId)));
  const legacy = await getDocs(query(collection(db, 'bookings'), where('carId', '==', carId)));
  const all = [...snapshot.docs, ...legacy.docs];
  const seen = new Set<string>();
  return all
    .filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    })
    .map((d) => normalizeBooking(d.id, d.data()));
}

export async function fetchAllBookings(): Promise<Booking[]> {
  const snapshot = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => normalizeBooking(d.id, d.data()));
}

export function subscribeBookings(callback: (bookings: Booking[]) => void): Unsubscribe {
  const apply = (snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => {
    callback(snapshot.docs.map((d) => normalizeBooking(d.id, d.data())));
  };

  return onSnapshot(
    query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
    apply,
    () => onSnapshot(collection(db, 'bookings'), apply),
  );
}

export async function createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'bookings'), {
    car_id: data.car_id,
    carId: data.car_id,
    car_name: data.car_name,
    carName: data.car_name,
    customer_name: data.customer_name,
    customerName: data.customer_name,
    customer_email: data.customer_email,
    customerEmail: data.customer_email,
    customer_phone: data.customer_phone,
    customerPhone: data.customer_phone,
    start_date: data.start_date,
    startDate: data.start_date,
    end_date: data.end_date,
    endDate: data.end_date,
    total_price: data.total_price,
    totalPrice: data.total_price,
    status: data.status,
    userId: data.userId ?? null,
    createdAt: serverTimestamp(),
    payment_option: data.payment_option ?? null,
    gcash_number: data.gcash_number ?? null,
    gcash_reference: data.gcash_reference ?? null,
    gcash_screenshot: data.gcash_screenshot ?? null,
    payment_amount: data.payment_amount ?? null,
    payment_submitted_at: data.payment_submitted_at ?? null,
  });
  return docRef.id;
}

export async function fetchBookingById(id: string): Promise<Booking | null> {
  const snapshot = await getDoc(doc(db, 'bookings', id));
  if (!snapshot.exists()) return null;
  return normalizeBooking(snapshot.id, snapshot.data());
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  await updateDoc(doc(db, 'bookings', id), { status });
}

export function subscribeUserBookings(userId: string, callback: (bookings: Booking[]) => void): Unsubscribe {
  return onSnapshot(query(collection(db, 'bookings'), where('userId', '==', userId)), (snapshot) => {
    callback(snapshot.docs.map((d) => normalizeBooking(d.id, d.data())));
  });
}
