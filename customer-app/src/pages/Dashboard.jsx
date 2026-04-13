import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import Loader from '../components/UI/Loader';
import { formatPrice } from '../utils/formatters';
import Button from '../components/UI/Button';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [exportOrders, setExportOrders] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [quickRange, setQuickRange] = useState('month');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate.toISOString();
        params.endDate = dateRange.endDate.toISOString();
      }

      console.log('📡 Fetching stats with params:', params);

      const [summaryRes, dailyRes, ordersRes] = await Promise.all([
        api.get('/orders/stats/summary', { params }),
        api.get('/orders/stats/daily', { params }),
        api.get('/orders/export', { params })
      ]);

      console.log('📊 Summary:', summaryRes.data);
      console.log('📈 Daily:', dailyRes.data);
      console.log('📦 Export orders count:', ordersRes.data.length);

      setSummary(summaryRes.data);
      setDailyData(dailyRes.data);
      setExportOrders(ordersRes.data);
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRange = (range) => {
    const today = new Date();
    let start = new Date();
    if (range === 'today') start = today;
    else if (range === 'week') start.setDate(today.getDate() - 7);
    else if (range === 'month') start.setMonth(today.getMonth() - 1);
    setDateRange({ startDate: start, endDate: today });
    setQuickRange(range);
  };

  const exportToExcel = () => {
    const dataForExcel = exportOrders.map(order => ({
      'رقم الطلب': order._id.slice(-6).toUpperCase(),
      'العميل': order.user?.name,
      'الهاتف': order.phone,
      'التاريخ': new Date(order.createdAt).toLocaleDateString('ar-EG'),
      'الإجمالي': order.totalPrice,
      'العناصر': order.items.map(i => `${i.quantity}x ${i.name}`).join('، ')
    }));
    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المبيعات');
    XLSX.writeFile(wb, `مبيعات_الشطبي_${new Date().toLocaleDateString()}.xlsx`);
  };

  const barChartData = {
    labels: dailyData.map(d => d._id),
    datasets: [{
      label: 'الإيرادات (ج.م)',
      data: dailyData.map(d => d.revenue),
      backgroundColor: 'rgba(249, 115, 22, 0.6)',
      borderColor: '#f97316',
      borderWidth: 1,
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'الإيرادات اليومية' }
    }
  };

  const statusChartData = {
    labels: summary ? Object.keys(summary.ordersByStatus || {}) : [],
    datasets: [{
      label: 'عدد الطلبات',
      data: summary ? Object.values(summary.ordersByStatus || {}) : [],
      backgroundColor: ['#fbbf24', '#3b82f6', '#a855f7', '#22c55e'],
    }]
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div dir="rtl" className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم - الإحصائيات</h1>

      {/* Date Range Controls */}
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-sm mb-1">من</label>
          <DatePicker
            selected={dateRange.startDate}
            onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
            selectsStart
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            className="border rounded p-2"
            dateFormat="yyyy/MM/dd"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">إلى</label>
          <DatePicker
            selected={dateRange.endDate}
            onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
            selectsEnd
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            minDate={dateRange.startDate}
            className="border rounded p-2"
            dateFormat="yyyy/MM/dd"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={quickRange === 'today' ? 'primary' : 'secondary'} onClick={() => handleQuickRange('today')}>اليوم</Button>
          <Button variant={quickRange === 'week' ? 'primary' : 'secondary'} onClick={() => handleQuickRange('week')}>أسبوع</Button>
          <Button variant={quickRange === 'month' ? 'primary' : 'secondary'} onClick={() => handleQuickRange('month')}>شهر</Button>
        </div>
        <Button onClick={fetchData} variant="secondary">تحديث</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">إجمالي المبيعات</h3>
          <p className="text-3xl font-bold text-primary-600">{formatPrice(summary?.totalRevenue || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">عدد الطلبات المكتملة</h3>
          <p className="text-3xl font-bold">{summary?.totalOrders || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">متوسط قيمة الطلب</h3>
          <p className="text-3xl font-bold text-primary-600">{formatPrice(summary?.averageOrderValue || 0)}</p>
        </div>
      </div>

      {/* رسالة في حالة عدم وجود طلبات مكتملة */}
      {summary?.totalOrders === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          ⚠️ لا توجد طلبات مكتملة (Delivered) ضمن الفترة المحددة. يرجى تغيير نطاق التاريخ أو تغيير حالة بعض الطلبات إلى "تم التوصيل".
        </div>
      )}

      {/* Charts */}
      {/* Charts Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  {/* Bar Chart */}
  <div className="bg-white p-4 rounded-lg shadow">
    <Bar data={barChartData} options={barOptions} />
  </div>

  {/* Doughnut Chart - حجم مصغر */}
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4 text-center">توزيع حالة الطلبات</h3>
    {summary && Object.keys(summary.ordersByStatus || {}).length > 0 ? (
      <div className="w-64 h-64 mx-auto">
        <Doughnut data={statusChartData} options={{ maintainAspectRatio: true }} />
      </div>
    ) : (
      <p className="text-center text-gray-500">لا توجد بيانات كافية</p>
    )}
  </div>
</div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">قائمة الطلبات المكتملة</h2>
          <Button onClick={exportToExcel} variant="primary">تصدير إلى Excel</Button>
        </div>
        <p className="text-sm text-gray-600 mb-4">عدد الطلبات: {exportOrders.length}</p>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right">رقم الطلب</th>
                <th className="px-4 py-2 text-right">العميل</th>
                <th className="px-4 py-2 text-right">التاريخ</th>
                <th className="px-4 py-2 text-right">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exportOrders.slice(0, 20).map(order => (
                <tr key={order._id}>
                  <td className="px-4 py-2">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-2">{order.user?.name}</td>
                  <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="px-4 py-2">{formatPrice(order.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;