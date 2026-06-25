import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeCars } from '../services/firestore';
import { subscribeWebsiteReviews, addWebsiteReviewWithEmail, hashEmail, checkEmailAlreadyReviewed } from '../services/chatReviews';
import { auth, sendSignInLinkToEmail } from '../lib/firebase';
import type { Car, Review } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatCurrency, getCarImageUrl } from '../utils';

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Review form state ────────────────────────────────────────────────────────
  // Step: 'email' | 'link_sent' | 'verified' | 'submitted' | 'already_reviewed'
  const [reviewStep, setReviewStep] = useState<'email' | 'link_sent' | 'verified' | 'submitted' | 'already_reviewed'>('email');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [allWebsiteReviews, setAllWebsiteReviews] = useState<Review[]>([]);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [verifiedEmailHash, setVerifiedEmailHash] = useState('');

  // On mount: check if we just came back from a magic-link redirect
  useEffect(() => {
    const hash = sessionStorage.getItem('verifiedEmailHash');
    const email = sessionStorage.getItem('verifiedEmail');
    if (hash && email) {
      sessionStorage.removeItem('verifiedEmailHash');
      sessionStorage.removeItem('verifiedEmail');
      setVerifiedEmailHash(hash);
      setReviewEmail(email);
      setReviewStep('verified');
      // Scroll to reviews section
      setTimeout(() => {
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  useEffect(() => {
    const unsubCars = subscribeCars((cars) => {
      setFeaturedCars(cars.filter((c) => c.status === 'available').slice(0, 3));
      setLoading(false);
    });
    const unsubWebsiteReviews = subscribeWebsiteReviews(setAllWebsiteReviews);
    return () => {
      unsubCars();
      unsubWebsiteReviews();
    };
  }, []);



  /** Step 1 — send a magic-link to the given email */
  const handleSendVerificationLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    if (!reviewEmail.trim()) return;
    setSendingLink(true);
    try {
      // Check duplicate first (saves the user a round-trip)
      const emailHash = await hashEmail(reviewEmail);
      const alreadyReviewed = await checkEmailAlreadyReviewed(emailHash);
      if (alreadyReviewed) {
        setReviewStep('already_reviewed');
        setSendingLink(false);
        return;
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/review-verify`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, reviewEmail.trim(), actionCodeSettings);
      window.localStorage.setItem('reviewVerifyEmail', reviewEmail.trim());
      setReviewStep('link_sent');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send link.';
      setLinkError(msg);
    } finally {
      setSendingLink(false);
    }
  };

  /** Step 3 — submit the actual review after email is verified */
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim() || !verifiedEmailHash) return;
    setSubmittingReview(true);
    try {
      await addWebsiteReviewWithEmail(verifiedEmailHash, reviewName.trim(), reviewRating, reviewComment.trim());
      setReviewStep('submitted');
    } catch (err: unknown) {
      console.error('Error submitting review:', err);
      const msg = err instanceof Error ? err.message : 'Failed to submit review.';
      setLinkError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatReviewDate = (createdAt: unknown): string => {
    if (!createdAt) return '';
    const ts = createdAt as { toDate?: () => Date };
    const date = ts.toDate ? ts.toDate() : new Date(createdAt as string);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const avgRating = allWebsiteReviews.length
    ? allWebsiteReviews.reduce((s, r) => s + r.rating, 0) / allWebsiteReviews.length
    : 0;

  return (
    <>
      <div className="relative bg-navy text-white py-24 sm:py-32 overflow-hidden rounded-3xl mb-24 mx-4 sm:mx-6 lg:mx-8">
        <div className="absolute inset-0 opacity-15 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-navy to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 space-y-6">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-accent/25 border border-accent/30 text-accent uppercase tracking-wider">RJ Car Rental</span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-2xl leading-none">
            Rent a Car, <span className="text-accent">Drive Your Way</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-lg leading-relaxed">
            Experience maximum comfort, flexibility, and freedom with RJ Car Rental. Choose from a curated fleet of modern vehicles.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link to="/cars" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold transition-all shadow-md">Explore Fleet</Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all">How it works</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Our Featured Vehicles</h2>
          <p className="text-gray-500 mt-3 text-base">Select from our most popular vehicles, maintained to pristine standards.</p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading featured cars..." className="py-12" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.length ? featuredCars.map((car) => (
              <div key={car.id} className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  {getCarImageUrl(car) ? (
                    <img src={getCarImageUrl(car)} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50"><span className="text-xs uppercase font-bold">No Image</span></div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/95 text-navy border shadow-sm">{formatCurrency(car.daily_rate)} / day</div>
                </div>
                <div className="p-6 flex-grow">
                  <span className="text-xs font-bold uppercase text-accent">{car.category}</span>
                  <h3 className="text-lg font-bold text-navy mt-1">{car.brand} {car.model}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{car.description}</p>
                </div>
                <div className="px-6 pb-6">
                  <Link to={`/cars/${car.id}`} className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-navy text-navy hover:bg-navy hover:text-white text-sm font-semibold transition-all">Book Now</Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white">Currently no available cars to display.</div>
            )}
          </div>
        )}
      </div>

      <div id="how-it-works" className="bg-white border-y border-gray-150 py-24 mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">How It Works</h2>
            <p className="text-gray-500 mt-3">Rent your ideal car in 3 straightforward steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: '1. Choose a Car',
                desc: 'Filter and select from our diverse category of vehicles to match your specific plans.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              },
              {
                title: '2. Book Online',
                desc: 'Pick reservation dates, fill out details, and pay securely in seconds.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: '3. Drive Away',
                desc: 'Collect your keys, complete check-in, and embark on your journey!',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 012-2h2a2 2 0 012 2v3a2 2 0 01-2 2h-1.658a1 1 0 00-.707.293l-5.586 5.586a1 1 0 01-.707.293h-1.586a1 1 0 01-.707-.293l-1.586-1.586a1 1 0 01-.293-.707v-1.586a1 1 0 01.293-.707L13.586 7.707A1 1 0 0014.293 7H15z" />
                  </svg>
                )
              },
            ].map((step) => (
              <div key={step.title} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center text-navy">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-navy">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Us & Googleplex Map Location Section */}
      <div id="about-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* About Info + Pictures */}
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase text-accent tracking-widest">Our Headquarters</span>
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">About RJ Car Rentals</h2>
            <p className="text-gray-500 leading-relaxed">
              We've been providing premium car rental services since 2021, with a commitment to excellence and customer satisfaction.
            </p>
            <p className="text-gray-500 leading-relaxed mt-4">
              Our mission is to make car rentals accessible to everyone. With a diverse fleet of well-maintained vehicles and a team of dedicated professionals, we ensure that every rental experience is seamless and memorable.
            </p>
            <p className="text-gray-500 leading-relaxed mt-4">
              Whether you need a car for business, leisure, or a special occasion, RJ Car Rentals has the perfect vehicle for your needs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600" alt="RJ Car Rental Building" className="rounded-xl shadow-sm object-cover h-40 w-full" />
              <img src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600" alt="Fleet Parking Lot" className="rounded-xl shadow-sm object-cover h-40 w-full" />
            </div>
          </div>

          {/* Google Map Satellite View */}
          <div className="border border-gray-150 rounded-3xl overflow-hidden shadow-md h-full min-h-[400px]">
            <iframe 
              className="w-full h-full border-0 min-h-[400px]" 
              src="https://maps.google.com/maps?q=7.221251,124.530877&t=k&z=17&ie=UTF8&iwloc=&output=embed" 
              title="Google Map Satellite View"
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0}>
            </iframe>
          </div>
        </div>
      </div>


      {/* ===== REVIEWS COMMENT SECTION ===== */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">What Our Customers Say</h2>
          <p className="text-gray-500 mt-3">Real feedback from our road travelers. Share your experience too!</p>
        </div>

        {/* Rating Summary */}
        {allWebsiteReviews.length > 0 && (
          <div className="bg-white border border-gray-150 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="text-center shrink-0">
              <div className="text-6xl font-black text-navy leading-none">{avgRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-5 h-5 fill-current ${i < Math.round(avgRating) ? 'text-accent' : 'text-gray-200'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">{allWebsiteReviews.length} review{allWebsiteReviews.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = allWebsiteReviews.filter((r) => Math.round(r.rating) === star).length;
                const pct = allWebsiteReviews.length ? (count / allWebsiteReviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 w-4 text-right">{star}</span>
                    <svg className="w-3.5 h-3.5 fill-current text-accent shrink-0" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Write Review Inline Form — multi-step with email verification */}
        <div id="reviews-section" className="bg-white border border-gray-150 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-navy/8 flex items-center justify-center">
              <svg className="w-4 h-4 text-navy" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-navy leading-none">Leave a Review</h3>
              <p className="text-xs text-gray-400 mt-0.5">Verify your email first — one review per account</p>
            </div>
          </div>

          {/* ── Step indicator ─────────────────────────────────── */}
          {reviewStep !== 'submitted' && reviewStep !== 'already_reviewed' && (
            <div className="flex items-center gap-2 mb-6">
              {(['email', 'link_sent', 'verified'] as const).map((step, idx) => {
                const stepIndex = { email: 0, link_sent: 1, verified: 2 }[reviewStep] ?? 0;
                const isActive = idx === stepIndex;
                const isDone = idx < stepIndex;
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-navy text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isDone ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : idx + 1}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-navy' : 'text-gray-400'}`}>
                      {idx === 0 && 'Email'}
                      {idx === 1 && 'Verify'}
                      {idx === 2 && 'Review'}
                    </span>
                    {idx < 2 && <div className="flex-1 h-px bg-gray-150 w-6" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STEP 1: Enter email ─────────────────────────────── */}
          {reviewStep === 'email' && (
            <form onSubmit={handleSendVerificationLink} className="space-y-4">
              <div>
                <label htmlFor="rv-email" className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Your Email Address</label>
                <p className="text-xs text-gray-400 mb-3">
                  We'll send you a one-click verification link. No password needed. Each email can only post <strong>one review</strong>.
                </p>
                <div className="flex gap-2">
                  <input
                    id="rv-email"
                    required
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    className="premium-input bg-gray-50 flex-1"
                    placeholder="you@example.com"
                    disabled={sendingLink}
                  />
                  <button
                    type="submit"
                    disabled={sendingLink || !reviewEmail.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 shrink-0"
                  >
                    {sendingLink ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Link
                      </>
                    )}
                  </button>
                </div>
                {linkError && (
                  <p className="text-xs text-red-500 mt-2">{linkError}</p>
                )}
              </div>
            </form>
          )}

          {/* ── STEP 2: Link sent ───────────────────────────────── */}
          {reviewStep === 'link_sent' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-800">Check your inbox!</h4>
                  <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                    We sent a verification link to <strong>{reviewEmail}</strong>. Click the link in the email to verify your account and proceed with your review.
                  </p>
                  <p className="text-xs text-blue-400 mt-2">The link expires in 10 minutes. Check your spam folder if you don't see it.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setReviewStep('email'); setLinkError(''); }}
                className="text-xs text-gray-400 hover:text-navy transition-colors underline"
              >
                ← Use a different email
              </button>
            </div>
          )}

          {/* ── STEP 3: Verified — write the review ────────────── */}
          {reviewStep === 'verified' && (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-2">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-emerald-700 font-semibold">
                  Email verified: <span className="font-bold">{reviewEmail}</span>
                </p>
              </div>

              {/* Star Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 hover:scale-110 transition-transform"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <svg
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || reviewRating) ? 'text-accent fill-current' : 'text-gray-200 fill-current'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-navy">
                    {(hoverRating || reviewRating) === 1 && 'Poor'}
                    {(hoverRating || reviewRating) === 2 && 'Fair'}
                    {(hoverRating || reviewRating) === 3 && 'Good'}
                    {(hoverRating || reviewRating) === 4 && 'Great'}
                    {(hoverRating || reviewRating) === 5 && 'Excellent'}
                  </span>
                </div>
              </div>

              {/* Name + Comment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rv-name" className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Your Name</label>
                  <input
                    id="rv-name"
                    required
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="premium-input bg-gray-50"
                    placeholder="e.g. John Doe"
                    disabled={submittingReview}
                  />
                </div>
                <div className="sm:row-span-2">
                  <label htmlFor="rv-comment" className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Your Feedback</label>
                  <textarea
                    id="rv-comment"
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="premium-input bg-gray-50 resize-none py-3 h-full min-h-[100px]"
                    placeholder="Tell us about your experience..."
                    disabled={submittingReview}
                  />
                </div>
              </div>

              {linkError && <p className="text-xs text-red-500">{linkError}</p>}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Post Review
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 4: Submitted ───────────────────────────────── */}
          {reviewStep === 'submitted' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-navy">Thank you for your review!</h4>
                <p className="text-sm text-gray-400 mt-1">Your feedback helps others make the right choice. It's now live below.</p>
              </div>
            </div>
          )}

          {/* ── Already reviewed ────────────────────────────────── */}
          {reviewStep === 'already_reviewed' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-navy">Already Reviewed</h4>
                <p className="text-sm text-gray-400 mt-1">
                  <strong>{reviewEmail}</strong> has already submitted a review. Each email may only review once.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setReviewStep('email'); setReviewEmail(''); setLinkError(''); }}
                className="text-xs text-navy hover:underline font-semibold"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        {/* Comment Feed */}
        {allWebsiteReviews.length === 0 ? (
          <div className="py-16 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="text-sm font-medium">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allWebsiteReviews.map((review) => {
              const initials = review.user_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
              const colorClasses = [
                'bg-navy text-white',
                'bg-accent text-white',
                'bg-emerald-600 text-white',
                'bg-purple-600 text-white',
                'bg-amber-500 text-white',
              ];
              const colorIdx = review.user_name.charCodeAt(0) % colorClasses.length;
              return (
                <div key={review.id} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${colorClasses[colorIdx]}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">{review.user_name}</h4>
                          <span className="text-xs text-gray-400">{formatReviewDate(review.createdAt)}</span>
                        </div>
                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`w-4 h-4 fill-current ${i < review.rating ? 'text-accent' : 'text-gray-200'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.comment}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <div className="bg-navy text-white py-16 text-center rounded-3xl mx-4 sm:mx-6 lg:mx-8 mb-24 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to Hit the Road?</h2>
          <p className="text-gray-300 text-sm leading-relaxed">Rent your ideal car in just 3 clicks. Flexible GCash downpayments or in-person cash payments accepted.</p>
          <div className="pt-4">
            <Link to="/cars" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold transition-all shadow-md">Find a Car</Link>
          </div>
        </div>
      </div>
    </>
  );
}
