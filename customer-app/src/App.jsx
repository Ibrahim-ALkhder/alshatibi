import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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

// مكونات الحماية
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <NavigateBasedOnRole user={user} />;
  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  return (
    <BrowserRouter>
      <Routes>
        {/* المسارات العامة */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/driver/login" element={<PublicRoute><DriverLogin /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* مسارات العميل */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['customer']}><Layout><Home /></Layout></ProtectedRoute>
        } />
        <Route path="/menu" element={
          <ProtectedRoute allowedRoles={['customer']}><Layout><Menu /></Layout></ProtectedRoute>
        } />
        <Route path="/menu/:id" element={
          <ProtectedRoute allowedRoles={['customer']}><Layout><ItemDetail /></Layout></ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['customer']}><Layout><Cart /></Layout></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={['customer']}><Layout><Checkout /></Layout></ProtectedRoute>
        } />
        <Route path="/tracking/:id" element={
          <ProtectedRoute allowedRoles={['customer', 'staff', 'admin', 'driver']}><Layout><OrderTracking /></Layout></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['customer']}><Layout><OrderHistory /></Layout></ProtectedRoute>
        } />

        {/* مسارات الموظف */}
        <Route path="/staff/orders" element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}><Layout><StaffOrders /></Layout></ProtectedRoute>
        } />
        <Route path="/menu-management" element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}><Layout><MenuManagement /></Layout></ProtectedRoute>
        } />

        {/* مسارات المدير */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><Layout><Dashboard /></Layout></ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin']}><Layout><UsersManagement /></Layout></ProtectedRoute>
        } />

        {/* مسارات المندوب */}
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['driver']}><Layout><DriverDashboard /></Layout></ProtectedRoute>
        } />

        {/* ملف التعريف - متاح للجميع */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['customer', 'staff', 'admin', 'driver']}><Layout><Profile /></Layout></ProtectedRoute>
        } />

        {/* صفحة غير مصرح */}
        <Route path="/unauthorized" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">غير مصرح لك بالدخول هنا</h1><Link to="/" className="text-primary-600 mt-4 inline-block">العودة للرئيسية</Link></div>} />

        {/* تحويل أي مسار غير معروف */}
        <Route path="*" element={<NavigateToRoleDefault />} />
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

const NavigateToRoleDefault = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/dashboard" />;
  if (user.role === 'staff') return <Navigate to="/staff/orders" />;
  if (user.role === 'driver') return <Navigate to="/driver" />;
  return <Navigate to="/" />;
};

export default App;