import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteCar, subscribeCars } from '../../services/firestore';
import type { Car } from '../../types';
import { formatCurrency, getCarImageUrl } from '../../utils';

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => subscribeCars(setCars), []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    await deleteCar(id);
  };

  const getStatusBadge = (car: Car) => {
    const today = new Date().toISOString().split('T')[0];
    if (car.status === 'available') {
      if (car.available_from && car.available_from > today) {
        return { className: 'bg-amber-50 border border-amber-200 text-amber-600', text: `Available from ${new Date(car.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` };
      }
      return { className: 'bg-emerald-50 border border-emerald-200 text-emerald-600', text: 'Available' };
    }
    if (car.status === 'maintenance') {
      return { className: 'bg-rose-50 border border-rose-200 text-rose-600', text: 'Maintenance' };
    }
    return { className: 'bg-rose-50 border border-rose-200 text-rose-600', text: 'Unavailable' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl text-navy leading-tight">Manage Fleet Catalog</h2>
        <Link to="/admin/cars/create" className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-md">Add New Car</Link>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {cars.length ? cars.map((car) => {
          const badge = getStatusBadge(car);
          const imageUrl = getCarImageUrl(car);
          return (
            <div key={car.id} className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex gap-4">
                <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-150 shrink-0">
                  {imageUrl ? <img src={imageUrl} alt={car.brand} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">NO IMG</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-navy text-sm">{car.brand} {car.model}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Year: {car.year} | {car.transmission}</div>
                  <div className="mt-1"><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 border text-gray-600">{car.category}</span></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Rate</div>
                  <div className="font-bold text-navy text-sm">{formatCurrency(car.daily_rate)}/day</div>
                </div>
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.className}`}>{badge.text}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link to={`/admin/cars/${car.id}/edit`} className="flex-1 text-center py-2 bg-gray-50 hover:bg-gray-100 text-navy border border-gray-200 font-bold rounded-xl text-xs transition-colors">Edit</Link>
                <button type="button" onClick={() => handleDelete(car.id, `${car.brand} ${car.model}`)} className="flex-1 text-center py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold rounded-xl text-xs transition-colors">Delete</button>
              </div>
            </div>
          );
        }) : (
          <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white">No cars in fleet catalog. <Link to="/admin/cars/create" className="text-accent font-bold hover:underline">Add your first car</Link>.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-150">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Image</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Car Model</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Pricing / Day</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cars.length ? cars.map((car) => {
                const badge = getStatusBadge(car);
                const imageUrl = getCarImageUrl(car);
                return (
                  <tr key={car.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-150">
                        {imageUrl ? <img src={imageUrl} alt={car.brand} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-400">NO IMG</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-navy">{car.brand} {car.model}</div>
                      <div className="text-xs text-gray-400">Year: {car.year} | {car.transmission}</div>
                    </td>
                    <td className="px-6 py-4"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 border text-gray-600">{car.category}</span></td>
                    <td className="px-6 py-4 font-bold text-navy">{formatCurrency(car.daily_rate)}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${badge.className}`}>{badge.text}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link to={`/admin/cars/${car.id}/edit`} className="text-sm text-navy hover:text-accent font-bold">Edit</Link>
                        <button type="button" onClick={() => handleDelete(car.id, `${car.brand} ${car.model}`)} className="text-sm text-rose-500 hover:text-rose-700 font-bold">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No cars in fleet catalog. <Link to="/admin/cars/create" className="text-accent font-bold hover:underline">Add your first car</Link>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
