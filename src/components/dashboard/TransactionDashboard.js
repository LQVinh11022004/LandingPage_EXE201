import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, DollarSign, Star, Users, TrendingUp, Activity } from 'lucide-react';

const API_BASE_URL = 'https://mom-and-baby-e7dnhsgjcpgdb8cc.southeastasia-01.azurewebsites.net';

const Dashboard = () => {
  const [transactionData, setTransactionData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [rawTransactions, setRawTransactions] = useState([]);
  const [rawFeedbacks, setRawFeedbacks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(2025);

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      // Fetch transaction data
      const transactionResponse = await fetch(
        `${API_BASE_URL}/api/payment/transaction/dashboard?month=${month}&year=${year}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Fetch admin dashboard data
      const adminResponse = await fetch(
        `${API_BASE_URL}/api/admin/dashboard`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!transactionResponse.ok || !adminResponse.ok) {
        throw new Error('Lỗi khi tải dữ liệu từ API');
      }

      const transactionData = await transactionResponse.json();
      const adminData = await adminResponse.json();

      // Process the data
      processTransactionData(transactionData.transactions || []);
      processFeedbackData(adminData.feedbacks || []);
      
      // Calculate stats
      calculateStats(transactionData, adminData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const processTransactionData = (transactions) => {
    setRawTransactions(transactions);
    
    // Group transactions by date
    const dailyRevenue = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdTime).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, count: 0 };
      }
      acc[date].revenue += transaction.amount;
      acc[date].count += 1;
      return acc;
    }, {});

    const sortedData = Object.values(dailyRevenue).sort((a, b) => {
      const [dayA, monthA] = a.date.split('/');
      const [dayB, monthB] = b.date.split('/');
      return new Date(`2025-${monthA}-${dayA}`) - new Date(`2025-${monthB}-${dayB}`);
    });

    setTransactionData(sortedData);
  };

  const processFeedbackData = (feedbacks) => {
    setRawFeedbacks(feedbacks);
    
    // Group feedbacks by rating
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating: `${rating} sao`,
      count: feedbacks.filter(f => f.stars === rating).length,
      percentage: feedbacks.length > 0 ? Math.round((feedbacks.filter(f => f.stars === rating).length / feedbacks.length) * 100) : 0
    }));

    setFeedbackData(ratingDistribution);
  };

  const calculateStats = (transactionData, adminData) => {
    const transactions = transactionData.transactions || [];
    const feedbacks = adminData.feedbacks || [];
    
    const totalRevenue = transactionData.total || 0;
    const avgRating = feedbacks.length > 0 ? 
      (feedbacks.reduce((sum, f) => sum + f.stars, 0) / feedbacks.length).toFixed(1) : '0';
    
    // Calculate payment method distribution
    const paymentMethods = transactions.reduce((acc, transaction) => {
      let method = 'Khác';
      if (transaction.transferAccountName === 'PayOS') {
        method = 'PayOS';
      } else{
        method = 'Chuyển khoản ngân hàng';
      } 
      
      if (!acc[method]) {
        acc[method] = { method, count: 0, amount: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += transaction.amount;
      return acc;
    }, {});

    setStats({
      totalRevenue,
      totalTransactions: transactions.length,
      avgRating,
      feedbackCount: feedbacks.length,
      userPayPackageCount: adminData.userPayPackageCount || 0,
      paymentMethods: Object.values(paymentMethods)
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const FEEDBACK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mom & Baby Analytics Dashboard</h1>
          <p className="text-gray-600">Tổng quan về doanh thu và phản hồi khách hàng</p>
          
          {/* Date Filter */}
          <div className="mt-4 flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Tháng:</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            
            <label className="text-sm font-medium text-gray-700">Năm:</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue || 0)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng giao dịch</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}/5 ⭐</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người dùng trả phí</p>
                <p className="text-2xl font-bold text-gray-900">{stats.userPayPackageCount || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Revenue Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Doanh thu theo ngày
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transactionData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `${(value / 1000)}k`} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Feedback Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Phân bố đánh giá
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feedbackData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ rating, percentage }) => `${rating}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {feedbackData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FEEDBACK_COLORS[index % FEEDBACK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Số lượng']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Count by Day */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Số lượng giao dịch theo ngày
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip formatter={(value) => [value, 'Giao dịch']} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
              Phương thức thanh toán
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.paymentMethods || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, count }) => `${method}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(stats.paymentMethods || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Số giao dịch']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Giao dịch gần đây</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Thời gian</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Số tiền</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tài khoản</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {rawTransactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(transaction.createdTime).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {transaction.transferAccountName}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Table */}
                <hr className="my-8 border-gray-300" />

        
      </div>
    </div>
  );
};

export default Dashboard;