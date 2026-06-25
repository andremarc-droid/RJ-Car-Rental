import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'contact_inquiries'), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-xs font-bold uppercase text-accent tracking-widest bg-accent/10 px-3 py-1 rounded-full">Contact</span>
        <h1 className="text-4xl sm:text-5xl font-black text-navy tracking-tight leading-none">
          Get in Touch
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Have any questions? Send us a message and our team will get back to you shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto bg-orange-50/60 border border-orange-100/70 rounded-3xl p-8 sm:p-12 shadow-sm">
        {/* Left Column: Info Block (Transparent background, sitting on container warm cream background) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-navy leading-tight">
              Let's connect and discuss your journey.
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Whether you need helper support, custom quotes for events, or long-term vehicle leasing, we are here 24/7 to answer your call.
            </p>

            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="font-bold text-navy w-16 shrink-0">Name:</span>
                <span className="font-semibold text-gray-800">Jacob Hawkins</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="font-bold text-navy w-16 shrink-0">Address:</span>
                <span className="text-gray-600">Villarica, Midsayap, Cotabato</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="font-bold text-navy w-16 shrink-0">Phone:</span>
                <span className="font-semibold text-gray-800">(+63) 966 024 4560</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="font-bold text-navy w-16 shrink-0">Hours:</span>
                <span className="text-gray-600">Monday – Sunday: 24/7</span>
              </li>
            </ul>
          </div>

          {/* Social Icons */}
          <div className="pt-6 border-t border-navy/10 flex items-center space-x-5 text-navy/70">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-accent hover:scale-110 transition-all">
              <span className="sr-only">Facebook</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H7v3h2v9h3v-9h3.61L15 8h-3V6.25c0-.76.18-1 .75-1H15V2h-2.58c-2.6 0-3.42 1.34-3.42 3.25V8z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-accent hover:scale-110 transition-all">
              <span className="sr-only">Twitter</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-accent hover:scale-110 transition-all">
              <span className="sr-only">Instagram</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-accent hover:scale-110 transition-all">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-accent hover:scale-110 transition-all">
              <span className="sr-only">Pinterest</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.168 1.777 2.168 2.128 0 3.768-2.243 3.768-5.484 0-2.861-2.062-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.166-1.495-.69-2.433-2.878-2.433-4.617 0-3.772 2.74-7.23 7.897-7.23 4.15 0 7.375 2.957 7.375 6.91 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.02 12.017.02z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right Column: Email Form Card (Light) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-navy/10 flex flex-col justify-center">
          {success ? (
            <div className="text-center py-12 space-y-6 animate-in fade-in duration-300">
              <div className="mx-auto w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center text-accent">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-navy">Message Sent Successfully!</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Thank you for contacting us. Jacob Hawkins or one of our team representatives will reply to your email shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-navy/20 text-navy hover:bg-navy/5 text-sm font-semibold transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-rose-600 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">{error}</p>}
              
              <div>
                <label htmlFor="contact-name" className="block text-[10px] font-bold tracking-wider text-navy/70 uppercase mb-1">Name</label>
                <input
                  id="contact-name"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-navy/20 focus:border-accent py-2 text-sm text-navy focus:outline-none transition-colors placeholder-gray-400"
                  placeholder="e.g. John Doe"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-[10px] font-bold tracking-wider text-navy/70 uppercase mb-1">Email</label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-navy/20 focus:border-accent py-2 text-sm text-navy focus:outline-none transition-colors placeholder-gray-400"
                  placeholder="john@example.com"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-[10px] font-bold tracking-wider text-navy/70 uppercase mb-1">Subject</label>
                <input
                  id="contact-subject"
                  required
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent border-b border-navy/20 focus:border-accent py-2 text-sm text-navy focus:outline-none transition-colors placeholder-gray-400"
                  placeholder="Inquiry about..."
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[10px] font-bold tracking-wider text-navy/70 uppercase mb-1">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-transparent border-b border-navy/20 focus:border-accent py-2 text-sm text-navy focus:outline-none resize-none transition-colors placeholder-gray-400"
                  placeholder="Write your message here..."
                  disabled={submitting}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold shadow-md text-sm transition-colors tracking-widest disabled:opacity-50"
                >
                  {submitting ? 'SENDING...' : 'SUBMIT'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
