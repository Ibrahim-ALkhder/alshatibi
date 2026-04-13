import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon, UserIcon, MenuIcon, XIcon } from '../UI/Icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isCustomer = user?.role === 'customer';
  const isStaff = user?.role === 'staff';
  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  // روابط العميل (تظهر في شريط سفلي للعميل أو القائمة الجانبية)
  const customerNavLinks = [
    { to: '/', label: '🏠 الرئيسية' },
    { to: '/menu', label: '🍽️ القائمة' },
    { to: '/orders', label: '📦 طلباتي' },
  ];

  // روابط الإدارة (للشاشات الكبيرة - في الشريط العلوي)
  const getAdminNavLinks = () => {
    if (isAdmin) {
      return [
        { to: '/dashboard', label: '📊 الإحصائيات' },
        { to: '/staff/orders', label: '📋 الطلبات' },
        { to: '/menu-management', label: '🍽️ القائمة' },
        { to: '/users', label: '👥 المستخدمين' },
      ];
    }
    if (isStaff) {
      return [
        { to: '/staff/orders', label: '📋 الطلبات' },
        { to: '/menu-management', label: '🍽️ القائمة' },
      ];
    }
    return [];
  };

  const adminNavLinks = getAdminNavLinks();

  // روابط القائمة الجانبية للموبايل (تجمع كل شيء)
  const getMobileMenuLinks = () => {
    const links = [];
    if (isCustomer) links.push(...customerNavLinks);
    if (isAdmin || isStaff) links.push(...adminNavLinks);
    if (isDriver) links.push({ to: '/driver', label: '🛵 لوحة المندوب' });
    links.push({ to: '/profile', label: '👤 الملف الشخصي' });
    return links;
  };

  const mobileMenuLinks = getMobileMenuLinks();

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileDrawerOpen(false);
    setProfileMenuOpen(false);
  };

  const closeDrawer = () => setMobileDrawerOpen(false);

  return (
    <>
      {/* الشريط الرئيسي */}
      <nav className="bg-white shadow-md sticky top-0 z-40" aria-label="الشريط الرئيسي">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* القسم الأيمن: الشعار فقط */}
            <div className="flex items-center">
              <Link
                to={isAdmin ? '/dashboard' : isStaff ? '/staff/orders' : isDriver ? '/driver' : '/'}
                className="text-xl lg:text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
              >
                الشطبي
              </Link>
            </div>

            {/* القسم الأوسط: روابط الإدارة (تظهر فقط للموظف والمدير في الشاشات الكبيرة) */}
            {!isCustomer && !isDriver && adminNavLinks.length > 0 && (
              <div className="hidden lg:flex items-center justify-center flex-1 space-x-8 space-x-reverse">
                {adminNavLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`font-bold text-xl hover:text-primary-600 transition-colors ${
                      location.pathname === link.to
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="ml-1">{link.label.charAt(0)}</span>
                    <span>{link.label.substring(2)}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* القسم الأيسر: السلة + البروفايل + زر الجوال */}
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* سلة التسوق - للعميل فقط */}
              {isCustomer && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label={`سلة التسوق ${totalItems > 0 ? `تحوي ${totalItems} عنصر` : 'فارغة'}`}
                >
                  <ShoppingCartIcon className="w-6 h-6 lg:w-7 lg:h-7" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {/* أيقونة البروفايل مع قائمة منسدلة - للشاشات الكبيرة */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 space-x-reverse p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                  aria-label="قائمة المستخدم"
                >
                  <UserIcon className="w-7 h-7" />
                  <span className="font-medium text-lg">{user?.name}</span>
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-40">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <span className="text-xl ml-3">👤</span>
                        <span>الملف الشخصي</span>
                      </Link>
                      {isDriver && (
                        <Link
                          to="/driver"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <span className="text-xl ml-3">🛵</span>
                          <span>لوحة المندوب</span>
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="text-xl ml-3">🚪</span>
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* زر القائمة الجانبية للجوال */}
              <button
                className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="فتح القائمة الجانبية"
              >
                <MenuIcon className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* شريط سفلي للعميل فقط (روابط الرئيسية، القائمة، طلباتي) */}
      {isCustomer && (
        <div className="admin-glass-bar sticky top-16 lg:top-20 z-30 hidden lg:block">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
              {customerNavLinks.map(link => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`admin-quick-link whitespace-nowrap ${isActive ? 'active' : ''}`}
                  >
                    <span className="emoji-icon">{link.label.charAt(0)}</span>
                    <span>{link.label.substring(2)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer (قائمة جانبية) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileDrawerOpen ? 'visible' : 'invisible'}`}
        aria-hidden={!mobileDrawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            mobileDrawerOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={closeDrawer}
        />
        
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="القائمة الرئيسية"
        >
          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="text-2xl font-bold text-primary-600">الشطبي</h2>
            <button
              onClick={closeDrawer}
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
              aria-label="إغلاق القائمة"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-1">
            {user && (
              <div className="px-4 py-4 text-gray-700 bg-gray-50 rounded-xl mb-3">
                <p className="font-semibold text-lg">{user.name}</p>
                <p className="text-sm text-gray-500 break-all">{user.email}</p>
              </div>
            )}

            {mobileMenuLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-4 py-3.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                onClick={closeDrawer}
              >
                <span className="text-2xl ml-4">{link.label.charAt(0)}</span>
                <span className="text-base font-medium">{link.label.substring(2)}</span>
              </Link>
            ))}

            <hr className="my-3" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <span className="text-2xl ml-4">🚪</span>
              <span className="text-base font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;