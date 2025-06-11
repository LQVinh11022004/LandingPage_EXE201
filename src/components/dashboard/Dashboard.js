import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import Header from './Header';
import TransactionDashboard from './TransactionDashboard';
import AccountsTable from './AccountsTable';
import UpdateModal from './UpdateModal';
import Sidebar from '../Sidebar';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0); // Thêm state total
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
  const [month, setMonth] = useState(6); // Default to June
  const [year, setYear] = useState(2025); // Default to current year

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
      const response = await fetch(`https://mom-and-baby-e7dnhsgjcpgdb8cc.southeastasia-01.azurewebsites.net/api/account?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let responseData = await response.json().catch(() => ({}));

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
      const response = await fetch(`https://mom-and-baby-e7dnhsgjcpgdb8cc.southeastasia-01.azurewebsites.net/api/payment/transaction/dashboard?month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let responseData = await response.json().catch(() => ({}));
      console.log('Transaction Dashboard Response:', responseData); // Debug log

      if (response.ok) {
        setTransactions(responseData.transactions || []);
        setTotal(responseData.total || 0); // Gán total từ response
      } else {
        setErrorMessage('Failed to fetch transaction dashboard');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      console.error('Fetch transaction error:', error);
    } finally {
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
      const response = await fetch(`https://mom-and-baby-e7dnhsgjcpgdb8cc.southeastasia-01.azurewebsites.net/api/account/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      let responseData = await response.json().catch(() => ({}));

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
              <TransactionDashboard
                transactions={transactions}
                total={total} // Truyền total qua props
                month={month}
                year={year}
                setMonth={setMonth}
                setYear={setYear}
                fetchTransactionDashboard={fetchTransactionDashboard}
                errorMessage={errorMessage}
                isLoading={isLoading}
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