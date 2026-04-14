import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import DriverLogin from './pages/DriverLogin';
import Register from './pages/Register';
import Menu from './pages/Menu';
import ItemDetail from './pages/ItemDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import StaffOrders from './pages/StaffOrders';
import MenuManagement from './pages/MenuManagement';
import Dashboard from './pages/Dashboard';
import UsersManagement from './pages/UsersManagement';
import DriverDashboard from './pages/DriverDashboard';
import Loader from './components/UI/Loader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  const isCustomer = user?.role === 'customer';
  const isStaff = user?.role === 'staff';
  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (isAdmin) return '/dashboard';
    if (isStaff) return '/staff/orders';
    if (isDriver) return '/driver';
    return '/';
  };

  return (
    <BrowserRouter>
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop rtl />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/admin/login" element={!user ? <AdminLogin /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/driver/login" element={!user ? <DriverLogin /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getDefaultRoute()} />} />

        {/* Protected routes with Layout */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          {/* Customer routes */}
          {isCustomer && (
            <>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="menu/:id" element={<ItemDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="tracking/:id" element={<OrderTracking />} />
              <Route path="orders" element={<OrderHistory />} />
            </>
          )}

          {/* Staff / Admin routes */}
          {(isStaff || isAdmin) && (
            <>
              <Route index element={<Navigate to={isAdmin ? "dashboard" : "staff/orders"} />} />
              <Route path="staff/orders" element={<StaffOrders />} />
              <Route path="menu-management" element={<MenuManagement />} />
              {isAdmin && (
                <>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<UsersManagement />} />
                </>
              )}
            </>
          )}

          {/* Driver routes */}
          {isDriver && (
            <>
              <Route index element={<Navigate to="driver" />} />
              <Route path="driver" element={<DriverDashboard />} />
            </>
          )}

          {/* Common */}
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;