import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/landing/LandingPage'
import PublicCatalogPage from './pages/catalog/CatalogPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import OrderConfirmation from './pages/checkout/OrderConfirmation'
import PaymentSuccess from './pages/payment/PaymentSuccess'
import PaymentFailure from './pages/payment/PaymentFailure'
import PaymentPending from './pages/payment/PaymentPending'

import LoginPage from './pages/admin/LoginPage'
import RegisterPage from './pages/register/RegisterPage'
import AdminLayout from './pages/admin/layout/AdminLayout'
import DashboardPage from './pages/admin/dashboard/DashboardPage'
import OrdersPage from './pages/admin/orders/OrdersPage'
import OrderDetailPage from './pages/admin/orders/OrderDetailPage'
import CustomersPage from './pages/admin/customers/CustomersPage'
import CatalogPage from './pages/admin/catalog/CatalogPage'
import CalendarPage from './pages/admin/calendar/CalendarPage'
import ReportsPage from './pages/admin/reports/ReportsPage'
import SettingsPage from './pages/admin/settings/SettingsPage'
import BillingPage from './pages/admin/billing/BillingPage'
import CouponsPage from './pages/admin/coupons/CouponsPage'
import CustomerLoginPage from './pages/cuenta/LoginPage'
import CustomerRegisterPage from './pages/cuenta/RegisterPage'
import CustomerOrdersPage from './pages/cuenta/OrdersPage'

import SuperadminLayout from './pages/superadmin/SuperadminLayout'
import MetricsPage from './pages/superadmin/MetricsPage'
import TenantsPage from './pages/superadmin/TenantsPage'
import TenantDetailPage from './pages/superadmin/TenantDetailPage'
import PlansPage from './pages/superadmin/PlansPage'

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalogo" element={<PublicCatalogPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pedido/:id" element={<OrderConfirmation />} />
            <Route path="/payment/success/" element={<PaymentSuccess />} />
            <Route path="/payment/failure/" element={<PaymentFailure />} />
            <Route path="/payment/pending/" element={<PaymentPending />} />

            {/* Auth */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Cuenta cliente */}
            <Route path="/cuenta/login" element={<CustomerLoginPage />} />
            <Route path="/cuenta/registro" element={<CustomerRegisterPage />} />
            <Route path="/cuenta/pedidos" element={<CustomerOrdersPage />} />

            {/* Admin protected (tenant_admin y staff) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute excludeRole="platform_owner">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="coupons" element={<CouponsPage />} />
            </Route>

            {/* Superadmin protected (platform_owner only) */}
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute requiredRole="platform_owner">
                  <SuperadminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/superadmin/metrics" replace />} />
              <Route path="metrics" element={<MetricsPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="tenants/:id" element={<TenantDetailPage />} />
              <Route path="plans" element={<PlansPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  )
}
