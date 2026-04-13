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

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  const isCustomer = user?.role === 'customer';
  const isStaff = user?.role === 'staff';
  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  return (
    <BrowserRouter>
      <Routes>
        {/* صفحات تسجيل الدخول العامة */}
        <Route path="/login" element={!user ? <Login /> : <NavigateBasedOnRole user={user} />} />
        <Route path="/admin/login" element={!user ? <AdminLogin /> : <NavigateBasedOnRole user={user} />} />
        <Route path="/driver/login" element={!user ? <DriverLogin /> : <NavigateBasedOnRole user={user} />} />
        <Route path="/register" element={!user ? <Register /> : <NavigateBasedOnRole user={user} />} />

        {/* مسارات العميل المحمية */}
        {isCustomer && (
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:id" element={<ItemDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/tracking/:id" element={<OrderTracking />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        )}

        {/* مسارات الموظف والمدير المحمية */}
        {(isStaff || isAdmin) && (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to={isAdmin ? "/dashboard" : "/staff/orders"} />} />
            <Route path="/staff/orders" element={<StaffOrders />} />
            <Route path="/menu-management" element={<MenuManagement />} />
            {isAdmin && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UsersManagement />} />
              </>
            )}
            <Route path="/profile" element={<Profile />} />
          </Route>
        )}

        {/* مسارات المندوب المحمية */}
        {isDriver && (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/driver" />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        )}

        {/* تحويل أي مسار غير معروف إلى الصفحة الافتراضية حسب الدور */}
        <Route path="*" element={<NavigateToRoleDefault user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

// مكونات مساعدة
const NavigateBasedOnRole = ({ user }) => {
  if (user?.role === 'admin') return <Navigate to="/dashboard" />;
  if (user?.role === 'staff') return <Navigate to="/staff/orders" />;
  if (user?.role === 'driver') return <Navigate to="/driver" />;
  return <Navigate to="/" />;
};

const NavigateToRoleDefault = ({ user }) => {
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/dashboard" />;
  if (user.role === 'staff') return <Navigate to="/staff/orders" />;
  if (user.role === 'driver') return <Navigate to="/driver" />;
  return <Navigate to="/" />;
};

export default App;