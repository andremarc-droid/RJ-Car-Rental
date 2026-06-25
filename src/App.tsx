import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminRoute from './components/routing/AdminRoute';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCarsPage from './pages/admin/AdminCarsPage';
import AdminCarFormPage from './pages/admin/AdminCarFormPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import ReviewVerifyPage from './pages/ReviewVerifyPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="cars" element={<CarsPage />} />
            <Route path="cars/:id" element={<CarDetailPage />} />
            <Route path="bookings/success/:id" element={<BookingSuccessPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          <Route path="review-verify" element={<ReviewVerifyPage />} />
          <Route path="login" element={<CustomerLoginPage />} />

          <Route path="admin/login" element={<AdminLoginPage />} />

          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="cars" element={<AdminCarsPage />} />
              <Route path="cars/create" element={<AdminCarFormPage />} />
              <Route path="cars/:id/edit" element={<AdminCarFormPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
