import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { subscribeUserBookings } from '../services/firestore';
import type { Booking } from '../types';
import { bookingStatusClasses, formatCurrency, formatDisplayDate } from '../utils';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const unsub = subscribeUserBookings(user.uid, (data) => {
      setBookings(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (!user) {
    return (
      <div className="py-20 text-center px-4">
        <p className="text-gray-500 mb-4">Please sign in to view your bookings.</p>
        <Link to="/login" className="text-accent font-bold hover:underline">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner label="Loading bookings..." /></div>;
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-navy">My Rental History</h2>
        <Link to="/cars" className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold">New Reservation</Link>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-150">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Reference</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Rental Range</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length ? bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{booking.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-semibold text-navy">{booking.car_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDisplayDate(booking.start_date)} – {formatDisplayDate(booking.end_date)}</td>
                  <td className="px-6 py-4 font-bold text-navy">{formatCurrency(booking.total_price)}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${bookingStatusClasses(booking.status)}`}>{booking.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">You have no current or past rental history.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
