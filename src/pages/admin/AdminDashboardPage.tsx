import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeBookings, subscribeCars } from '../../services/firestore';
import type { Booking, Car } from '../../types';
import { bookingStatusClasses, formatCurrency } from '../../utils';

export default function AdminDashboardPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const unsubCars = subscribeCars(setCars);
    const unsubBookings = subscribeBookings(setBookings);
    return () => {
      unsubCars();
      unsubBookings();
    };
  }, []);

  const stats = useMemo(() => ({
    totalCars: cars.length,
    availableCars: cars.filter((c) => c.status === 'available').length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    activeBookings: bookings.filter((b) => b.status === 'active').length,
    confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
    totalRevenue: bookings.filter((b) => ['confirmed', 'active', 'completed'].includes(b.status)).reduce((sum, b) => sum + b.total_price, 0),
    recentBookings: bookings.slice(0, 5),
  }), [cars, bookings]);

  return (
    <div className="space-y-8">
      <h2 className="font-semibold text-xl text-navy leading-tight">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Vehicles', value: stats.totalCars, badge: `${stats.availableCars} active`, badgeColor: 'text-emerald-500 bg-emerald-50' },
          { label: 'Total Bookings', value: stats.totalBookings, badge: `${stats.pendingBookings} pending`, badgeColor: 'text-amber-500 bg-amber-50' },
          { label: 'Active Rentals', value: stats.activeBookings, badge: `${stats.confirmedBookings} confirmed`, badgeColor: 'text-blue-500 bg-blue-50' },
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), badge: null, badgeColor: '' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            {card.badge && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>{card.badge}</span>}
            <h3 className="text-3xl font-black text-navy mt-4">{card.value}</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-navy mb-6">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { to: '/admin/cars/create', title: 'Add New Vehicle', desc: 'Add a car to the fleet catalog', color: 'accent' },
              { to: '/admin/cars', title: 'Manage Fleet', desc: 'Edit, update, or remove vehicles', color: 'navy' },
              { to: '/admin/bookings', title: 'View Bookings', desc: 'Manage all customer reservations', color: 'blue' },
            ].map((action) => (
              <Link key={action.to} to={action.to} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-150 transition-all">
                <div className="h-10 w-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy text-lg font-bold">+</div>
                <div>
                  <span className="text-sm font-bold text-navy">{action.title}</span>
                  <p className="text-xs text-gray-400">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs font-bold text-accent hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentBookings.length ? stats.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-sm font-bold text-navy">{booking.customer_name}</span>
                  <span className="text-xs text-gray-400 block">{booking.car_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-navy">{formatCurrency(booking.total_price)}</span>
                  <span className={`block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${bookingStatusClasses(booking.status)}`}>{booking.status}</span>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">No bookings yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
