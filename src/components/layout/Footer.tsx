import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto border-t border-navy-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <span className="text-2xl font-black text-white">
              RJ<span className="text-accent"> Car Rental</span>
            </span>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">
              Rent premium and budget-friendly cars in just 3 clicks. Drive away hassle-free today.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/cars" className="hover:text-white transition-colors">Our Fleet</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200">Support</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-300">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><span className="text-gray-400">FAQs</span></li>
              <li><span className="text-gray-400">Privacy Policy</span></li>
            </ul>
          </div>
          <div id="contact">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200">Get in Touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>(+63) 966 024 4560</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>royrojas012294@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="h-5 w-5 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Monday – Sunday: 24/7</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="h-5 w-5 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Villarica, Midsayap, Cotabato</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-navy-dark text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} RJ Car Rental. All rights reserved. Made for premium car rental solutions.
        </div>
      </div>
    </footer>
  );
}
