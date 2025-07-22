import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, DollarSign, Star, Users, TrendingUp, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE_URL = 'https://momandbaby-exe201.onrender.com';

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
  
  // Pagination state for transactions
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rawTransactions]);

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
    // Sort transactions by date (newest first for display, but we'll sort chart data separately)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.createdTime) - new Date(a.createdTime)
    );
    setRawTransactions(sortedTransactions);
    
    // Group transactions by date for chart
    const dailyRevenue = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdTime);
      const dateKey = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
      
      if (!acc[dateKey]) {
        acc[dateKey] = { 
          date: dateKey, 
          revenue: 0, 
          count: 0,
          timestamp: date // Keep timestamp for proper sorting
        };
      }
      acc[dateKey].revenue += transaction.amount;
      acc[dateKey].count += 1;
      return acc;
    }, {});

    // Sort by actual date (oldest to newest for chart display)
    const sortedData = Object.values(dailyRevenue).sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    // Remove timestamp from final data (not needed for chart display)
    const chartData = sortedData.map(({ timestamp, ...rest }) => rest);
    
    setTransactionData(chartData);
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

  // Pagination logic
  const totalPages = Math.ceil(rawTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = rawTransactions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
            {feedbackData.filter(item => item.count > 0).length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={feedbackData.filter(item => item.count > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rating, percentage }) => percentage > 0 ? `${rating}: ${percentage}%` : null}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {feedbackData.filter(item => item.count > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={FEEDBACK_COLORS[parseInt(entry.rating.split(' ')[0]) - 1]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Số lượng']} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Feedback Legend */}
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {feedbackData.filter(item => item.count > 0).map((feedback) => {
                    const starNumber = parseInt(feedback.rating.split(' ')[0]);
                    return (
                      <div key={feedback.rating} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded mr-2"
                            style={{ backgroundColor: FEEDBACK_COLORS[starNumber - 1] }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                            {feedback.rating}
                            {' '.repeat(starNumber).replace(/ /g, '⭐')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {feedback.count} đánh giá ({feedback.percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Chưa có đánh giá nào</p>
                  <p className="text-sm">Đánh giá sẽ hiển thị khi có khách hàng feedback</p>
                </div>
              </div>
            )}
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
        // Remove the label prop entirely to avoid text cutoff
        outerRadius={100} // Increased from 80 to make pie chart bigger
        fill="#8884d8"
        dataKey="count"
      >
        {(stats.paymentMethods || []).map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip 
        formatter={(value, name, props) => [
          `${value} giao dịch (${Math.round((value / stats.totalTransactions) * 100)}%)`, 
          props.payload.method
        ]} 
      />
    </PieChart>
  </ResponsiveContainer>
  
  {/* Enhanced Payment Methods Legend */}
  <div className="mt-4 grid grid-cols-1 gap-3">
    {(stats.paymentMethods || []).map((method, index) => (
      <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center">
          <div 
            className="w-5 h-5 rounded mr-3"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          ></div>
          <span className="text-sm font-semibold text-gray-800">{method.method}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {method.count} giao dịch ({Math.round((method.count / stats.totalTransactions) * 100)}%)
          </div>
          <div className="text-xs text-gray-600">
            {formatCurrency(method.amount)}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        </div>

        {/* All Transactions Table with Pagination */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Tất cả giao dịch ({rawTransactions.length} giao dịch)
            </h3>
            <div className="text-sm text-gray-600">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, rawTransactions.length)} trong tổng số {rawTransactions.length} giao dịch
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">STT</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thời gian</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Số tiền</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tài khoản</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mã GD</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(transaction.createdTime).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transaction.transferAccountName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {transaction.id || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Table */}
        <hr className="my-8 border-gray-300" />
        
      </div>
    </div>
  );
};

export default Dashboard;