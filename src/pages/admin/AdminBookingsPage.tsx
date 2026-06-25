import { useEffect, useState } from 'react';
import { subscribeBookings, updateBookingStatus } from '../../services/firestore';
import type { Booking, BookingStatus } from '../../types';
import { bookingStatusClasses, formatCurrency, formatDisplayDate } from '../../utils';

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => subscribeBookings(setBookings), []);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    await updateBookingStatus(id, status);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-xl text-navy leading-tight">All Bookings</h2>

      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-150">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Rental Period</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Payment Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Receipt</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length ? bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{booking.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-navy">{booking.customer_name}</div>
                    <div className="text-xs text-gray-400">{booking.customer_email}</div>
                    <div className="text-xs text-gray-400">{booking.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-navy">{booking.car_name}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{formatDisplayDate(booking.start_date)}</div>
                    <div className="text-xs text-gray-400">to {formatDisplayDate(booking.end_date)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-navy">{formatCurrency(booking.total_price)}</div>
                    {booking.payment_amount && (
                      <div className="text-[10px] text-gray-400 italic">
                        Amount Paid: {formatCurrency(booking.payment_amount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {booking.gcash_number ? (
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-navy">GCash: {booking.gcash_number}</div>
                        <div className="text-[10px] text-gray-500">Ref: {booking.gcash_reference}</div>
                        <span className="inline-block text-[9px] font-black uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                          {booking.payment_option === 'downpayment' ? 'Downpayment' : 'Full Payment'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No GCash Details</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {booking.gcash_screenshot ? (
                      <button
                        type="button"
                        onClick={() => setSelectedScreenshot(booking.gcash_screenshot || null)}
                        className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 block hover:opacity-80 transition-opacity"
                      >
                        <img src={booking.gcash_screenshot} alt="Receipt Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No receipt</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${bookingStatusClasses(booking.status)}`}>{booking.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                      className="premium-input bg-gray-50 text-xs py-1.5 px-3 rounded-lg"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="py-12 text-center text-gray-400">No bookings have been made yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Modal for Receipt Verification */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center"
            >
              ×
            </button>
            <h3 className="text-lg font-bold text-navy mb-4">GCash Payment Receipt Screenshot</h3>
            <div className="w-full max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-xl border p-2">
              <img src={selectedScreenshot} alt="GCash Receipt Full Size" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedScreenshot(null)}
                className="px-4 py-2 bg-navy text-white font-bold rounded-xl text-sm hover:bg-navy-dark transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
