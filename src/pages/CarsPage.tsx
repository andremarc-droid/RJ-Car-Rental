import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from '../components/cars/CarCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { subscribeBookings, subscribeCars } from '../services/firestore';
import type { Booking, Car } from '../types';
import { CAR_CATEGORIES } from '../types';
import { isCarAvailableForDates, todayString } from '../utils';

export default function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(searchParams.get('start_date') ?? '');
  const [endDate, setEndDate] = useState(searchParams.get('end_date') ?? '');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [seats, setSeats] = useState('');
  const [transmission, setTransmission] = useState('');

  useEffect(() => {
    const unsubCars = subscribeCars((data) => {
      setCars(data);
      setLoading(false);
    });
    const unsubBookings = subscribeBookings(setBookings);
    return () => {
      unsubCars();
      unsubBookings();
    };
  }, []);

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (startDate && endDate && !isCarAvailableForDates(car, startDate, endDate, bookings)) return false;
      if (brand.trim()) {
        const term = brand.toLowerCase();
        if (!`${car.brand} ${car.model}`.toLowerCase().includes(term)) return false;
      }
      if (category && car.category !== category) return false;
      if (seats && car.seats < parseInt(seats, 10)) return false;
      if (transmission && car.transmission !== transmission) return false;
      return true;
    });
  }, [cars, bookings, startDate, endDate, brand, category, seats, transmission]);

  const onDateChange = () => {
    if (startDate && endDate) {
      const params = new URLSearchParams(searchParams);
      params.set('start_date', startDate);
      params.set('end_date', endDate);
      setSearchParams(params);
    }
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    const params = new URLSearchParams(searchParams);
    params.delete('start_date');
    params.delete('end_date');
    setSearchParams(params);
  };

  const resetFilters = () => {
    setBrand('');
    setCategory('');
    setSeats('');
    setTransmission('');
    clearDates();
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-semibold text-xl text-navy leading-tight mb-8">Explore Our Rental Fleet</h2>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4 lg:sticky lg:top-28 h-fit bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-navy">Filters</h3>
              <button type="button" onClick={resetFilters} className="text-xs font-semibold text-accent hover:underline">Reset All</button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
                <label className="block text-xs font-black text-navy uppercase tracking-wider">Check Availability</label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pick-up Date</label>
                    <input type="date" value={startDate} min={todayString()} onChange={(e) => setStartDate(e.target.value)} onBlur={onDateChange} className="premium-input bg-white text-sm w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Drop-off Date</label>
                    <input type="date" value={endDate} min={startDate || todayString()} onChange={(e) => setEndDate(e.target.value)} onBlur={onDateChange} className="premium-input bg-white text-sm w-full" />
                  </div>
                </div>
                {startDate && endDate && (
                  <div className="text-[10px] text-navy font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Showing cars available for selected dates
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Search Brand/Model</label>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Toyota, Mitsubishi" className="premium-input bg-gray-50 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="premium-input bg-gray-50 text-sm">
                  <option value="">All Categories</option>
                  {CAR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Minimum Seats</label>
                <select value={seats} onChange={(e) => setSeats(e.target.value)} className="premium-input bg-gray-50 text-sm">
                  <option value="">Any Capacity</option>
                  <option value="2">2+ Seats</option>
                  <option value="4">4+ Seats</option>
                  <option value="5">5+ Seats</option>
                  <option value="7">7+ Seats</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transmission</label>
                <div className="space-y-2 mt-1">
                  {['', 'automatic', 'manual'].map((value) => (
                    <label key={value || 'all'} className="flex items-center text-sm text-gray-600 cursor-pointer">
                      <input type="radio" checked={transmission === value} onChange={() => setTransmission(value)} className="rounded border-gray-300 text-navy focus:ring-navy" />
                      <span className="ms-2 capitalize">{value || 'All'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
                <LoadingSpinner label="Loading fleet..." />
              </div>
            )}

            {!loading && filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCars.map((car) => <CarCard key={car.id} car={car} />)}
              </div>
            ) : !loading ? (
              <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center p-8">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.17-2.707a1.95 1.95 0 0 0-1.93-1.826H18.75m-6.75 6.75H15m-1.5-6.75v-1.5h-3.75v1.5m-3-1.5H3.75m4.5 0h9" /></svg>
                <h3 className="text-lg font-bold text-navy mb-2">{startDate && endDate ? 'No Cars Available for Selected Dates' : 'No Vehicles Available at the Moment'}</h3>
                <p className="text-sm text-gray-500 max-w-sm">{startDate && endDate ? 'Try different dates or clear the date filter to see all vehicles.' : 'We currently have no cars listed for rent.'}</p>
                {startDate && endDate && (
                  <button type="button" onClick={clearDates} className="mt-4 text-xs font-bold text-accent hover:underline">Clear Date Filter</button>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
