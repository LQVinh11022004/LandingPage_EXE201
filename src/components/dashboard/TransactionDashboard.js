// TransactionDashboard.jsx
import React, { useMemo } from 'react';
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

const TransactionDashboard = ({
  transactions = [],
  total = 0,
  month,
  year,
  setMonth,
  setYear,
  fetchTransactionDashboard,
  errorMessage,
  isLoading,
  adminDashboardData = {},
}) => {
  const { feedbacks = [], feedbackCount = 0, userPayPackageCount = 0 } = adminDashboardData;

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

  const generateColors = (count) => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const barData = useMemo(() => ({
    labels: transactions.map((t) => t.type || 'Unknown'),
    datasets: [
      {
        label: 'Amount (VND)',
        data: transactions.map((t) => t.amount || 0),
        backgroundColor: generateColors(transactions.length),
        borderColor: generateColors(transactions.length),
        borderWidth: 1,
      },
    ],
  }), [transactions]);

  const pieData = useMemo(() => ({
    labels: transactions.map((t) => `${t.transferAccountName || 'Unknown'} (${t.amount || 0} VND)`),
    datasets: [
      {
        data: transactions.map((t) => t.amount || 0),
        backgroundColor: generateColors(transactions.length),
        borderColor: ['#FFFFFF'],
        borderWidth: 1,
      },
    ],
  }), [transactions]);

  const lineData = useMemo(() => ({
    labels: transactions.map((t) => formatDate(t.createdTime)),
    datasets: [
      {
        label: 'Total Amount (VND)',
        data: transactions.map((t) => t.amount || 0),
        fill: false,
        borderColor: '#36A2EB',
        tension: 0.1,
      },
    ],
  }), [transactions]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Transaction Overview' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  if (!transactions || transactions.length === 0) {
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
          <div className="text-center text-gray-600 mt-4">No transaction data available.</div>
        </div>
      </motion.div>
    );
  }

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
              className="w-20 p-2 border border-gray-300 rounded-lg"
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
              className="w-24 p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-5"
          >
            Refresh
          </button>
        </div>

        <div className="mb-4 text-lg font-semibold text-green-700 flex justify-end">
          Total Transaction Amount: {total.toLocaleString()} VND
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 p-4 rounded-lg text-center text-green-800 font-semibold">
            Total Feedbacks: {feedbackCount}
          </div>
          <div className="bg-blue-100 p-4 rounded-lg text-center text-blue-800 font-semibold">
            Total Paid Packages: {userPayPackageCount}
          </div>
        </div>

        {feedbacks.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Recent Feedbacks</h4>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {feedbacks.map((fb) => (
                <li key={fb.id} className="p-2 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium">
                    ⭐ {fb.stars} – {fb.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(fb.createdTime).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
              <div className="text-gray-600">Loading charts...</div>
            </div>
          )}
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
        </div>

        {errorMessage && (
          <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-lg text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionDashboard;