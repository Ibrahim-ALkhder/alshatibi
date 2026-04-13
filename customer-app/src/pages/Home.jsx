import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="text-center py-8 md:py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">
        مرحباً {user?.name} في الشطبي
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        أشهى المأكولات السودانية في قلب القاهرة
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link to="/menu" className="bg-primary-600 hover:bg-primary-700 text-white p-6 rounded-lg shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">تصفح القائمة</h2>
          <p>اكتشف تشكيلة واسعة من الأطباق السودانية الأصيلة</p>
        </Link>
        <Link to="/orders" className="bg-gray-800 hover:bg-gray-900 text-white p-6 rounded-lg shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">طلباتي</h2>
          <p>تابع طلباتك السابقة والحالية</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;