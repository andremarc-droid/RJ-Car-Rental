import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { fetchBookingById } from '../services/firestore';
import type { Booking } from '../types';
import { formatCurrency, formatDisplayDate } from '../utils';

export default function BookingSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchBookingById(id).then((data) => {
      setBooking(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner label="Loading confirmation..." /></div>;
  }

  if (!booking) {
    return <div className="py-20 text-center text-gray-500">Booking not found.</div>;
  }

  return (
    <div className="py-12 max-w-2xl mx-auto text-center px-4">
      <div className="bg-white border border-gray-150 rounded-2xl p-8 space-y-8 shadow-sm">
        <div className="mx-auto w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-navy">Reservation Successful!</h1>
          <p className="text-gray-500 max-w-md mx-auto">Your reservation has been submitted. We will confirm your booking shortly.</p>
        </div>

        <div className="border-t border-b border-gray-150 py-6 text-left space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reservation Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-xs text-gray-400 block font-semibold">Booking Reference</span><span className="text-sm font-bold text-gray-800">#{booking.id.slice(0, 8).toUpperCase()}</span></div>
            <div><span className="text-xs text-gray-400 block font-semibold">Status</span><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-600 border border-amber-200">{booking.status}</span></div>
            <div><span className="text-xs text-gray-400 block font-semibold">Customer Name</span><span className="text-sm font-bold text-gray-800">{booking.customer_name}</span></div>
            <div><span className="text-xs text-gray-400 block font-semibold">Contact Number</span><span className="text-sm font-bold text-gray-800">{booking.customer_phone}</span></div>
            <div className="col-span-2"><span className="text-xs text-gray-400 block font-semibold">Email Address</span><span className="text-sm font-bold text-gray-800">{booking.customer_email}</span></div>
          </div>
          <div className="border-t border-gray-150 pt-4 grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-gray-50 p-4 border border-gray-150 rounded-xl">
              <span className="text-xs text-gray-400 block font-bold uppercase mb-1">Vehicle</span>
              <span className="text-base font-bold text-navy">{booking.car_name}</span>
            </div>
            <div><span className="text-xs text-gray-400 block font-semibold">Pick-up Date</span><span className="text-sm font-bold text-gray-800">{formatDisplayDate(booking.start_date)}</span></div>
            <div><span className="text-xs text-gray-400 block font-semibold">Return Date</span><span className="text-sm font-bold text-gray-800">{formatDisplayDate(booking.end_date)}</span></div>
          </div>
          <div className="border-t border-gray-150 pt-4 flex justify-between items-center font-bold text-navy">
            <span>Total Amount</span>
            <span className="text-xl">{formatCurrency(booking.total_price)}</span>
          </div>
        </div>

        <Link to="/cars" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold transition-all shadow-md text-sm">Browse More Cars</Link>
      </div>
    </div>
  );
}
