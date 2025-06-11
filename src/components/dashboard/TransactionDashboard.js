import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const TransactionDashboard = ({ transactions, month, year, setMonth, setYear, fetchTransactionDashboard, errorMessage, isLoading, total }) => {
  // Debug log để kiểm tra giá trị total
  useEffect(() => {
    console.log('Total received in TransactionDashboard:', total);
  }, [total]);

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
    fetchTransactionDashboard();
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
    fetchTransactionDashboard();
  };

  const handleRefresh = () => {
    fetchTransactionDashboard();
  };

  const barData = {
    labels: transactions.map(t => t.type || 'Unknown'),
    datasets: [{
      label: 'Amount (VND)',
      data: transactions.map(t => t.amount || 0),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      borderWidth: 1
    }]
  };

  const pieData = {
    labels: transactions.map(t => `${t.transferAccountName || 'Unknown'} (${t.amount || 0} VND)`),
    datasets: [{
      data: transactions.map(t => t.amount || 0),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      borderColor: ['#FFFFFF'],
      borderWidth: 1
    }]
  };

  const lineData = {
    labels: transactions.map(t => new Date(t.createdTime || Date.now()).toLocaleDateString()),
    datasets: [{
      label: 'Total Amount (VND)',
      data: transactions.map(t => t.amount || 0),
      fill: false,
      borderColor: '#36A2EB',
      tension: 0.1
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Transaction Overview' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-pink-800 mb-8 text-center">Dashboard</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold text-pink-700 mb-3">Transaction Dashboard</h3>
        <div className="mb-4 flex space-x-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="number"
              value={month}
              onChange={handleMonthChange}
              min="1"
              max="12"
              className="w-20 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={handleYearChange}
              min="2000"
              max="2100"
              className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-5"
          >
            Refresh
          </button>
        </div>
        {/* Hiển thị tổng số tiền với fallback nếu total không có */}
        <div className="mb-4 text-lg font-semibold text-green-700 flex justify-end">
          Total Transaction Amount: {total !== undefined ? total.toLocaleString() : 'N/A'} VND
        </div>
        {transactions.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Charts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">Amount by Type</h5>
                <Bar data={barData} options={chartOptions} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">Transaction Distribution</h5>
                <Pie data={pieData} options={chartOptions} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-gray-600 mb-2">Amount Trend</h5>
                <Line data={lineData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 text-red-500 bg-red-100 p-4 rounded-lg text-center">{errorMessage}</div>
        )}
        {isLoading && <div className="text-center text-gray-600">Loading...</div>}
      </div>
    </motion.div>
  );
};

export default TransactionDashboard;