// Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import Header from './Header';
import TransactionDashboard from './TransactionDashboard';
import AccountsTable from './AccountsTable';
import UpdateModal from './UpdateModal';
import Sidebar from '../Sidebar';
import { debounce } from 'lodash';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mom-and-baby-e7dnhsgjcpgdb8cc.southeastasia-01.azurewebsites.net';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [adminDashboardData, setAdminDashboardData] = useState({ feedbacks: [], feedbackCount: 0, userPayPackageCount: 0 });
  const [total, setTotal] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(2025);

  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAccountData();
    fetchTransactionDashboard();
    fetchAdminDashboard();

    const handleResize = debounce(() => {
      setIsSidebarOpen(window.innerWidth >= 768);
    }, 100);
    window.addEventListener('resize', handleResize);
    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, [isAuthenticated, navigate, pageIndex, month, year]);

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
      const response = await fetch(`${API_BASE_URL}/api/account?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let responseData = await response.json().catch((err) => {
        console.error('JSON parsing error:', err);
        return {};
      });

      if (response.ok) {
        setAccounts(responseData.items || []);
        setTotalItemsCount(responseData.totalItemsCount || 0);
        setPageIndex(responseData.pageIndex || newPageIndex);
        setTotalPagesCount(responseData.totalPagesCount || 1);
        setHasNext(responseData.next || false);
        setHasPrevious(responseData.previous || false);
      } else {
        let errorMsg = response.status === 404 ? 'Account endpoint not found.' : responseData.message || `Error ${response.status}`;
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactionDashboard = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/transaction/dashboard?month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let responseData = await response.json().catch((err) => {
        console.error('JSON parsing error:', err);
        return {};
      });

      if (response.ok) {
        setTransactions(responseData.transactions || []);
        setTotal(responseData.total || 0);
      } else {
        setErrorMessage('Failed to fetch transaction dashboard');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminDashboard = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let responseData = await response.json().catch((err) => {
        console.error('JSON parsing error:', err);
        return {};
      });

      if (response.ok) {
        setAdminDashboardData(responseData);
      } else {
        setErrorMessage('Failed to fetch admin dashboard data');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
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
      const response = await fetch(`${API_BASE_URL}/api/account/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      let responseData = await response.json().catch((err) => {
        console.error('JSON parsing error:', err);
        return {};
      });

      if (response.ok) {
        setErrorMessage('Account updated successfully!');
        fetchAccountData();
      } else {
        let errorMsg = response.status === 404 ? 'Account endpoint not found.' : responseData.message || `Error ${response.status}`;
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      setErrorMessage('Network error during update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} location={location} />
      <div className="flex flex-1 pt-16">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} bg-gray-100 min-h-[calc(100vh-4rem)]`}>
          <Outlet />
          {location.pathname === '/dashboard' && (
            <>
              {accounts.length === 0 && !isLoading && !errorMessage && (
                <div className="text-center text-gray-600 mt-4">No accounts available.</div>
              )}
              <TransactionDashboard
                transactions={transactions}
                total={total}
                month={month}
                year={year}
                setMonth={setMonth}
                setYear={setYear}
                fetchTransactionDashboard={fetchTransactionDashboard}
                errorMessage={errorMessage}
                isLoading={isLoading}
                adminDashboardData={adminDashboardData}
              />
              <AccountsTable
                accounts={accounts}
                isLoading={isLoading}
                errorMessage={errorMessage}
                pageIndex={pageIndex}
                totalPagesCount={totalPagesCount}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                fetchAccountData={fetchAccountData}
                openUpdateModal={(account) => {
                  setSelectedAccount(account);
                  setFullName(account.fullName || '');
                  setDateOfBirth(account.dateOfBirth ? account.dateOfBirth.split('T')[0] : '');
                  setSex(account.sex || '');
                  setIsUpdateModalOpen(true);
                }}
              />
            </>
          )}
          {isUpdateModalOpen && (
            <UpdateModal
              selectedAccount={selectedAccount}
              fullName={fullName}
              setFullName={setFullName}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              sex={sex}
              setSex={setSex}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              setIsUpdateModalOpen={setIsUpdateModalOpen}
              updateAccount={updateAccount}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;