import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition duration-150 ease-in-out ${
    isActive
      ? 'border-accent text-navy'
      : 'border-transparent text-gray-500 hover:text-navy hover:border-gray-300'
  }`;

export default function Navbar() {
  const { user, isAdmin, displayName, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-150/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-navy">
                RJ<span className="text-accent"> Car Rental</span>
              </span>
            </Link>

            <div className="hidden md:flex md:space-x-8 md:ms-10">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/cars" className={navLinkClass}>
                Browse Cars
              </NavLink>
              <NavLink to="/how-it-works" className={navLinkClass}>
                How It Works
              </NavLink>
              <NavLink to="/contact" className={navLinkClass}>
                Contact
              </NavLink>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && !isAdmin && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-navy hover:bg-gray-50"
                >
                  <span className="h-8 w-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  {displayName}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-xl shadow-lg py-1 z-50">
                    <Link
                      to="/bookings"
                      className="block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <button
                      type="button"
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
            {user && isAdmin && (
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 border border-rose-100"
              >
                Log Out
              </button>
            )}

          </div>

          <div className="-me-2 flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-500 hover:text-navy hover:bg-gray-100"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-b border-gray-150 bg-white">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link to="/" className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/cars" className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Browse Cars</Link>
            <Link to="/how-it-works" className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>How It Works</Link>
            <Link to="/contact" className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Contact</Link>
            {user && !isAdmin && (
              <Link to="/bookings" className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>My Bookings</Link>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2.5 rounded-xl text-base font-semibold text-rose-500 hover:bg-rose-50"
              >
                Log Out
              </button>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
