import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { FaTachometerAlt, FaUsers, FaCog, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); // Visible on desktop by default
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');

  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAccountData();

    // Update sidebar visibility on window resize
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated, navigate, pageIndex]);

  const fetchAccountData = async (newPageIndex = pageIndex) => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const queryParams = new URLSearchParams({
      _pageIndex: newPageIndex.toString(),
      _pageSize: pageSize.toString(),
    });

    try {
      const response = await fetch(`https://localhost:7015/api/account?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response Status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = {};
      }

      if (response.ok) {
        setAccounts(responseData.items || []);
        setTotalItemsCount(responseData.totalItemsCount || 0);
        setPageIndex(responseData.pageIndex || newPageIndex);
        setTotalPagesCount(responseData.totalPagesCount || 1);
        setHasNext(responseData.next || false);
        setHasPrevious(responseData.previous || false);
        setIsLoading(false);
      } else {
        let errorMsg = 'Failed to fetch accounts';
        if (response.status === 404) {
          errorMsg = 'Account endpoint not found. Please check the backend server.';
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        } else {
          errorMsg = responseData.message || `Error ${response.status}`;
        }
        setErrorMessage(errorMsg);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMessage('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const updateAccount = async (id, body) => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7015/api/account/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Update API Response Status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = {};
      }

      if (response.ok) {
        setErrorMessage('Account updated successfully!');
        fetchAccountData();
      } else {
        let errorMsg = 'Failed to update account';
        if (response.status === 404) {
          errorMsg = 'Account endpoint not found.';
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        } else {
          errorMsg = responseData.message || `Error ${response.status}`;
        }
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error('Update error:', error);
      setErrorMessage('Network error during update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateModal = (account) => {
    setSelectedAccount(account);
    setFullName(account.fullName || '');
    setDateOfBirth(account.dateOfBirth ? account.dateOfBirth.split('T')[0] : '');
    setSex(account.sex || '');
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (!fullName || !dateOfBirth || !sex) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    let formattedDateOfBirth;
    try {
      const dateParts = dateOfBirth.split('-');
      if (dateParts.length === 3) {
        formattedDateOfBirth = `${dateOfBirth}T00:00:00.000Z`;
      } else {
        throw new Error('Invalid date format');
      }
    } catch (e) {
      setErrorMessage('Invalid date format. Use YYYY-MM-DD');
      return;
    }

    const body = {
      Id: selectedAccount.id,
      FullName: fullName,
      DateOfBirth: formattedDateOfBirth,
      Sex: sex,
      Status: selectedAccount.status || 'Active',
      Avatar: selectedAccount.avatar || null,
      CreatedTime: selectedAccount.createdTime || new Date().toISOString(),
      UpdatedTime: new Date().toISOString(),
      ...(selectedAccount.expert && {
        Expert: {
          Id: selectedAccount.expert.id,
          Degree: selectedAccount.expert.degree,
          Workplace: selectedAccount.expert.workplace,
          Description: selectedAccount.expert.description,
        },
      }),
    };

    updateAccount(selectedAccount.id, body);
    setIsUpdateModalOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-600 to-pink-800 text-white shadow-md fixed top-0 left-0 right-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="text-white text-2xl mr-4 focus:outline-none"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-pink-700 hover:bg-pink-900 px-4 py-2 rounded-lg transition duration-200"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -250 }}
          animate={{ x: isSidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-pink-100 to-pink-200 shadow-xl z-20"
        >
          <nav className="p-4 space-y-2">
            <h2 className="text-xl font-bold text-pink-800 mb-6">Admin Menu</h2>
            <a
              href="/dashboard"
              className="flex items-center space-x-3 text-pink-700 hover:bg-pink-300 p-3 rounded-lg transition duration-200"
            >
              <FaTachometerAlt className="text-lg" />
              <span>Dashboard</span>
            </a>
            <a
              href="/accounts"
              className="flex items-center space-x-3 text-pink-700 hover:bg-pink-300 p-3 rounded-lg transition duration-200"
            >
              <FaUsers className="text-lg" />
              <span>Accounts</span>
            </a>
            <a
              href="/settings"
              className="flex items-center space-x-3 text-pink-700 hover:bg-pink-300 p-3 rounded-lg transition duration-200"
            >
              <FaCog className="text-lg" />
              <span>Settings</span>
            </a>
          </nav>
        </motion.div>

        {/* Main Content */}
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
          } bg-gray-100 min-h-[calc(100vh-4rem)]`}
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-pink-800 mb-8 text-center"
          >
            Dashboard
          </motion.h1>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-pink-700 mb-3">Overview</h3>
              <p className="text-gray-700">Total Accounts: <span className="font-medium">{totalItemsCount}</span></p>
            </div>

            <h3 className="text-lg font-semibold text-pink-700 mb-4">Accounts List</h3>
            {errorMessage && (
              <div className="mb-4 text-red-500 bg-red-100 p-4 rounded-lg text-center">{errorMessage}</div>
            )}
            {isLoading ? (
              <div className="text-center text-gray-600">Loading...</div>
            ) : accounts.length === 0 ? (
              <div className="text-center text-gray-600 bg-white p-6 rounded-xl shadow-lg">No accounts found.</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-pink-50 text-pink-600">
                      <th className="p-4 text-left font-semibold">Full Name</th>
                      <th className="p-4 text-left font-semibold">Sex</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Expert</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <motion.tr
                        key={account.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-4 text-gray-700">{account.fullName || 'Unknown'}</td>
                        <td className="p-4 text-gray-700">{account.sex || 'N/A'}</td>
                        <td className="p-4 text-gray-700">{account.status || 'N/A'}</td>
                        <td className="p-4 text-gray-600">
                          {account.expert ? (
                            <>
                              {account.expert.degree || 'N/A'} - {account.expert.workplace || 'N/A'}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => openUpdateModal(account)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                          >
                            Update
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={() => fetchAccountData(pageIndex - 1)}
                disabled={!hasPrevious}
                className={`px-5 py-2 rounded-lg text-white transition duration-200 ${
                  hasPrevious ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <span className="text-gray-700">Page {pageIndex} of {totalPagesCount}</span>
              <button
                onClick={() => fetchAccountData(pageIndex + 1)}
                disabled={!hasNext}
                className={`px-5 py-2 rounded-lg text-white transition duration-200 ${
                  hasNext ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Custom Update Modal */}
      {isUpdateModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl relative"
          >
            <button
              onClick={() => setIsUpdateModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
            <h3 className="text-xl font-bold text-pink-800 mb-6">Update Account</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (YYYY-MM-DD)</label>
                <input
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Update
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;