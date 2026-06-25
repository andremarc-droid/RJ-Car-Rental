import { Link } from 'react-router-dom';
import type { Car } from '../../types';
import {
  carBadgeClasses,
  formatCurrency,
  getCarImageUrl,
  getCarStatusLabel,
  hasFutureAvailability,
  isCarCurrentlyBookable,
} from '../../utils';

interface CarCardProps {
  car: Car;
  showPriceFooter?: boolean;
  linkDisabled?: boolean;
}

export default function CarCard({ car, showPriceFooter = true, linkDisabled = false }: CarCardProps) {
  const bookable = isCarCurrentlyBookable(car);
  const imageUrl = getCarImageUrl(car);
  const statusLabel = getCarStatusLabel(car);

  return (
    <div
      className={`bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${
        !bookable ? 'opacity-60 grayscale-[0.4]' : ''
      }`}
    >
      <div>
        <div className="h-48 bg-gray-100 relative overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.17-2.707a1.95 1.95 0 0 0-1.93-1.826H18.75m-6.75 6.75H15m-1.5-6.75v-1.5h-3.75v1.5m-3-1.5H3.75m4.5 0h9" /></svg>
              <span className="text-xs uppercase font-bold tracking-wider">No Image</span>
            </div>
          )}
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${carBadgeClasses(car)}`}>
            {statusLabel}
          </div>
        </div>

        <div className="p-6">
          <span className="text-xs font-bold uppercase text-accent tracking-wider">{car.category}</span>
          <h3 className="text-lg font-bold text-navy mt-1">{car.brand} {car.model}</h3>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{car.description}</p>

          {car.status === 'available' && car.available_from && hasFutureAvailability(car) && (
            <p className="text-xs text-amber-600 font-semibold mt-2">Available from {new Date(car.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          )}

          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-400">
            <span className="flex items-center gap-1.5 capitalize">{car.transmission}</span>
            <span className="flex items-center gap-1.5">{car.seats} Seats</span>
            <span className="flex items-center gap-1.5">{car.fuel_type}</span>
          </div>
        </div>
      </div>

      {showPriceFooter && (
        <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
          <div>
            <span className="text-2xl font-black text-navy">{formatCurrency(car.daily_rate)}</span>
            <span className="text-xs text-gray-400">/ day</span>
          </div>
          {bookable && !linkDisabled ? (
            <Link to={`/cars/${car.id}`} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-navy hover:bg-navy-dark text-white text-sm font-semibold transition-all">
              View Details
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gray-400 text-white text-sm font-semibold cursor-not-allowed">
              {hasFutureAvailability(car) ? 'Coming Soon' : 'Not Available'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
