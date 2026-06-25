import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { averageRating, subscribeReviewsForCar } from '../services/chatReviews';
import { createBooking, fetchBookingsForCar, subscribeCar } from '../services/firestore';
import type { Booking, Car, Review } from '../types';
import {
  calculateRentalDays,
  calculateTotalPrice,
  formatCurrency,
  formatDisplayDate,
  getCarImageUrl,
  isCarAvailableForDates,
  parseDate,
  todayString,
} from '../utils';

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateWarning, setDateWarning] = useState('');

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeCar(id, (data) => {
      setCar(data);
      setLoading(false);
    });
    const unsubReviews = subscribeReviewsForCar(id, setReviews);
    fetchBookingsForCar(id).then(setBookings);
    return () => {
      unsub();
      unsubReviews();
    };
  }, [id]);

  const totalDays = useMemo(() => (startDate && endDate ? calculateRentalDays(startDate, endDate) : 0), [startDate, endDate]);
  const totalCost = car ? calculateTotalPrice(car.daily_rate, startDate, endDate) : 0;
  const avgRating = averageRating(reviews);

  const validateDates = () => {
    setDateWarning('');
    if (!car || !startDate || !endDate) return;

    const start = parseDate(startDate)!;
    const end = parseDate(endDate)!;

    if (car.available_from) {
      const from = parseDate(car.available_from)!;
      if (start < from) {
        setDateWarning(`Vehicle is only available starting from ${formatDisplayDate(car.available_from)}.`);
        return;
      }
    }

    if (car.available_until) {
      const until = parseDate(car.available_until)!;
      if (end > until) {
        setDateWarning(`Vehicle is only available until ${formatDisplayDate(car.available_until)}.`);
        return;
      }
    }

    if (!isCarAvailableForDates(car, startDate, endDate, bookings)) {
      setDateWarning('The selected vehicle is no longer available for the chosen dates.');
    }
  };

  useEffect(() => {
    validateDates();
  }, [startDate, endDate, car, bookings]);

  // Payment details state
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentOption, setPaymentOption] = useState<'full' | 'downpayment'>('full');
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashReference, setGcashReference] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const paymentAmount = paymentOption === 'full' ? totalCost : totalCost / 2;

  const handleScreenshotFile = (file: File | undefined) => {
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const convertScreenshotToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.7;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length * 0.75 > 500000 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || dateWarning) {
      alert(dateWarning || 'Please check your dates.');
      return;
    }
    if (!isCarAvailableForDates(car, startDate, endDate, bookings)) {
      alert('The selected vehicle is no longer available for the chosen dates.');
      return;
    }
    setStep(2);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || dateWarning) {
      alert(dateWarning || 'Please check your dates.');
      return;
    }

    if (!isCarAvailableForDates(car, startDate, endDate, bookings)) {
      alert('The selected vehicle is no longer available for the chosen dates.');
      return;
    }

    if (!screenshotFile) {
      alert('Please upload a screenshot of your payment receipt.');
      return;
    }

    if (!gcashNumber || gcashNumber.length < 11) {
      alert('Please enter a valid GCash mobile number (e.g. 0917XXXXXXX).');
      return;
    }

    if (!gcashReference) {
      alert('Please enter the GCash Reference Number.');
      return;
    }

    setBookingLoading(true);
    try {
      const screenshotBase64 = await convertScreenshotToBase64(screenshotFile);

      const bookingId = await createBooking({
        car_id: car.id,
        car_name: `${car.brand} ${car.model}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        start_date: startDate,
        end_date: endDate,
        total_price: totalCost,
        status: 'pending',
        userId: user?.uid,
        payment_option: paymentOption,
        gcash_number: gcashNumber,
        gcash_reference: gcashReference,
        gcash_screenshot: screenshotBase64,
        payment_amount: paymentAmount,
        payment_submitted_at: new Date().toISOString(),
      });
      navigate(`/bookings/success/${bookingId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading vehicle details..." size="lg" />
      </div>
    );
  }

  if (!car) {
    return <div className="py-20 text-center text-gray-500">Vehicle not found.</div>;
  }

  const imageUrl = getCarImageUrl(car);

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-[400px] bg-gray-50 w-full relative">
              {imageUrl ? (
                <img src={imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><span className="text-sm font-bold uppercase">No Image Available</span></div>
              )}
            </div>

            <div className="p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-150 pb-6 mb-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-accent tracking-widest bg-accent/10 px-3 py-1 rounded-full w-fit">{car.category}</span>
                  <h1 className="text-3xl font-black text-navy mt-2">{car.brand} {car.model}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${car.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                    {car.status === 'available' ? 'Available' : car.status === 'maintenance' ? 'Maintenance' : 'Unavailable'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-navy">{formatCurrency(car.daily_rate)}</span>
                  <span className="text-sm text-gray-500">/ day</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Year', value: car.year },
                  { label: 'Transmission', value: car.transmission },
                  { label: 'Fuel Type', value: car.fuel_type },
                  { label: 'Seats', value: `${car.seats} Passengers` },
                ].map((spec) => (
                  <div key={spec.label} className="bg-gray-50 p-4 border border-gray-150 rounded-xl">
                    <span className="block text-xs font-semibold text-gray-400 uppercase">{spec.label}</span>
                    <span className="text-lg font-bold text-gray-800 mt-1 block capitalize">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-150 pt-6 mb-8">
                <h3 className="text-lg font-bold text-navy mb-3">Vehicle Overview</h3>
                <p className="text-gray-600 leading-relaxed">{car.description}</p>
              </div>

              <div className="border-t border-gray-150 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-navy">Customer Reviews</h3>
                    <span className="text-sm font-bold text-gray-600">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.length ? reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50/50 p-5 border border-gray-150 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-800">{review.user_name}</h4>
                        <span className="text-xs text-amber-400">{'★'.repeat(review.rating)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400 border border-dashed border-gray-150 rounded-xl">No reviews yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-gray-150 rounded-2xl p-8 sticky top-24 shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-6">Reserve Vehicle</h3>
            {car.status === 'available' ? (
              !showForm ? (
                <button type="button" onClick={() => setShowForm(true)} className="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold transition-all shadow-md">Book Now</button>
              ) : step === 1 ? (
                <form onSubmit={proceedToPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                    <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="premium-input bg-gray-50" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                    <input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="premium-input bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Number</label>
                    <input required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="premium-input bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pick-up Date</label>
                    <input required type="date" value={startDate} min={todayString()} onChange={(e) => setStartDate(e.target.value)} className="premium-input bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Return Date</label>
                    <input required type="date" value={endDate} min={startDate || todayString()} onChange={(e) => setEndDate(e.target.value)} className="premium-input bg-gray-50" />
                  </div>
                  {dateWarning && <p className="text-xs text-rose-600 font-semibold">{dateWarning}</p>}
                  {totalDays > 0 && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                      <div className="flex justify-between text-xs text-gray-500"><span>Daily Rate:</span><span>{formatCurrency(car.daily_rate)}</span></div>
                      <div className="flex justify-between text-xs text-gray-500"><span>Duration:</span><span>{totalDays} day{totalDays > 1 ? 's' : ''}</span></div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-navy text-base"><span>Total Price:</span><span>{formatCurrency(totalCost)}</span></div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="w-1/3 py-3 border border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-100 text-sm">Back</button>
                    <button type="submit" disabled={!!dateWarning} className="w-2/3 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold shadow-md text-sm disabled:opacity-50">
                      Confirm Booking
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={submitBooking} className="space-y-4">
                  <div className="text-center bg-[#E0F2FE] border border-blue-200 rounded-xl p-4 mb-4">
                    <span className="text-xs font-bold uppercase text-blue-800 tracking-wider">GCash QR Payment</span>
                    <img src={new URL('../assets/gcash-pic-qrcode.jpg', import.meta.url).href} alt="GCash QR Code" className="mx-auto my-3 w-56 h-56 object-contain rounded-lg border bg-white shadow-sm" />
                    <p className="text-[11px] text-blue-700">Scan QR to make your GCash transfer.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Payment Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentOption('full')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${paymentOption === 'full' ? 'bg-accent text-white border-accent' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        Full ({formatCurrency(totalCost)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentOption('downpayment')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${paymentOption === 'downpayment' ? 'bg-accent text-white border-accent' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        Downpayment ({formatCurrency(totalCost / 2)})
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">GCash Number</label>
                    <input required type="tel" pattern="[0-9]{11}" placeholder="09XXXXXXXXX" value={gcashNumber} onChange={(e) => setGcashNumber(e.target.value)} className="premium-input bg-gray-50" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">GCash Reference Number</label>
                    <input required placeholder="13-digit Reference No." value={gcashReference} onChange={(e) => setGcashReference(e.target.value)} className="premium-input bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Payment Receipt Screenshot</label>
                    <div className="relative w-full h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                      {screenshotPreview ? (
                        <>
                          <img src={screenshotPreview} alt="Receipt Preview" className="w-full h-full object-contain rounded-xl" />
                          <button type="button" onClick={() => { setScreenshotPreview(null); setScreenshotFile(null); }} className="absolute top-2 right-2 h-6 w-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No screenshot selected</span>
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-600 cursor-pointer">
                      Upload Screenshot
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleScreenshotFile(e.target.files?.[0])} />
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 border border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-100 text-sm">Back</button>
                    <button type="submit" disabled={bookingLoading} className="w-2/3 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold shadow-md text-sm disabled:opacity-50">
                      {bookingLoading ? 'Submitting...' : 'Submit Payment'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-center">This vehicle is currently rented or in maintenance.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
