import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import NavbarComponent from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'));
const Farms = lazy(() => import('./pages/Farms'));
const FarmDetail = lazy(() => import('./pages/FarmDetail'));
const Crops = lazy(() => import('./pages/Crops'));
const CropDetail = lazy(() => import('./pages/CropDetail'));
const SoilReport = lazy(() => import('./pages/SoilReport'));
const Weather = lazy(() => import('./pages/Weather'));
const PestAlerts = lazy(() => import('./pages/PestAlerts'));
const Store = lazy(() => import('./pages/Store'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const Consultation = lazy(() => import('./pages/Consultation'));
const Forum = lazy(() => import('./pages/Forum'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavbarComponent />
        <Suspense fallback={<div className="loading-overlay"><LoadingSpinner /></div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Farmer Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/farms" element={
              <ProtectedRoute>
                <Farms />
              </ProtectedRoute>
            } />
            <Route path="/farms/:id" element={
              <ProtectedRoute>
                <FarmDetail />
              </ProtectedRoute>
            } />
            <Route path="/crops" element={
              <ProtectedRoute>
                <Crops />
              </ProtectedRoute>
            } />
            <Route path="/crops/:id" element={
              <ProtectedRoute>
                <CropDetail />
              </ProtectedRoute>
            } />
            <Route path="/soil" element={
              <ProtectedRoute>
                <SoilReport />
              </ProtectedRoute>
            } />
            <Route path="/weather" element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            } />
            <Route path="/pest-alerts" element={
              <ProtectedRoute>
                <PestAlerts />
              </ProtectedRoute>
            } />
            <Route path="/store" element={
              <ProtectedRoute>
                <Store />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/consultation" element={
              <ProtectedRoute>
                <Consultation />
              </ProtectedRoute>
            } />
            <Route path="/forum" element={
              <ProtectedRoute>
                <Forum />
              </ProtectedRoute>
            } />

            {/* Admin Route */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
