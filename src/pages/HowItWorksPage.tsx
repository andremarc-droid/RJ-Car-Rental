import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Choose Your Perfect Vehicle',
      description: 'Browse our extensive catalog of well-maintained vehicles. Use our premium filters to select by car type (Sedan, SUV, MPV, Pickup, Luxury, Sports, Electric), transmission (Manual or Automatic), fuel type, and price range. Check reviews and ratings from previous renters to make an informed choice.',
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Specify Rental Details',
      description: 'Click "Book Now" on your chosen vehicle. Fill out the reservation form with your full name, active email address, contact number, and select your desired pick-up and return dates. The system will automatically calculate the total cost based on the vehicle\'s daily rate and duration.',
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Submit Reservation & Secure Booking',
      description: 'Review your details and submit. Your reservation goes into "Pending" status while our team reviews the availability and schedule. No immediate credit card is required. You can pay via flexible GCash downpayments or in-person cash payments at pick-up.',
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Prepare Identification Requirements',
      description: 'To guarantee safety, we require a few documents upon pick-up: a valid Driver\'s License (Professional or Non-Professional) and at least one Government-Issued ID (e.g., Passport, UMID, SSS, or PRC ID). Make sure these are active and on-hand.',
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
    },
    {
      number: '05',
      title: 'Collect Keys & Go',
      description: 'Visit our main office located in Villarica, Midsayap, Cotabato. Perform a brief inspection of the car together with our representative, sign the quick rental agreement, grab your keys, and drive away! Enjoy unlimited mileage and 24/7 client support.',
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
    {
      number: '06',
      title: 'Easy Return Policy',
      description: 'When your rental period ends, bring the vehicle back to our office. We run a quick check of the car\'s condition and fuel level. Return the car with the same amount of fuel as it had at pick-up to avoid extra refuel fees.',
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-xs font-bold uppercase text-accent tracking-widest bg-accent/10 px-3 py-1 rounded-full">Guide</span>
        <h1 className="text-4xl sm:text-5xl font-black text-navy tracking-tight leading-none">
          How RJ Car Rental Works
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl leading-relaxed">
          Follow our 6 straightforward steps to reserve, collect, and drive away in your ideal vehicle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {steps.map((step) => (
          <div key={step.number} className="bg-white border border-gray-150 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-navy/5 rounded-2xl flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  {step.icon}
                </div>
                <span className="text-4xl font-black text-gray-200 tracking-tight group-hover:text-accent/25 transition-colors">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-bold text-navy mb-3 group-hover:text-accent transition-colors">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-navy text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 max-w-4xl mx-auto relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-black">Ready to choose your ride?</h2>
        <p className="text-gray-300 text-sm max-w-lg mx-auto leading-relaxed">
          Now that you know how the process works, browse our premium fleet catalog and secure your booking today!
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link to="/cars" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold transition-all shadow-md">
            Browse Our Fleet
          </Link>
          <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all">
            Get Support
          </Link>
        </div>
      </div>
    </div>
  );
}
