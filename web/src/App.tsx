import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './pages/CustomerForm';
import Sales from './pages/Sales';
import SaleDetail from './pages/SaleDetail';
import SaleForm from './pages/SaleForm';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import PickingDashboard from './pages/PickingDashboard';
import PickingDetail from './pages/PickingDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceForm from './pages/InvoiceForm';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import UserForm from './pages/UserForm';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="page-loader-inner" /></div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index                    element={<Dashboard />} />
            <Route path="sales"             element={<Sales />} />
            <Route path="sales/new"         element={<SaleForm />} />
            <Route path="sales/:id"         element={<SaleDetail />} />
            <Route path="orders"            element={<Orders />} />
            <Route path="orders/:id"        element={<OrderDetail />} />
            <Route path="picking"           element={<PickingDashboard />} />
            <Route path="picking/:id"       element={<PickingDetail />} />
            <Route path="products"          element={<Products />} />
            <Route path="products/new"      element={<ProductForm />} />
            <Route path="products/:id"      element={<ProductDetail />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="customers"         element={<Customers />} />
            <Route path="customers/new"     element={<CustomerForm />} />
            <Route path="customers/:id"     element={<CustomerDetail />} />
            <Route path="customers/:id/edit" element={<CustomerForm />} />
            <Route path="invoices"          element={<Invoices />} />
            <Route path="invoices/new"      element={<InvoiceForm />} />
            <Route path="invoices/:id"      element={<InvoiceDetail />} />
            <Route path="notifications"     element={<Notifications />} />
            <Route path="users"             element={<Users />} />
            <Route path="users/new"         element={<UserForm />} />
            <Route path="users/:id"         element={<UserDetail />} />
            <Route path="users/:id/edit"    element={<UserForm />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
