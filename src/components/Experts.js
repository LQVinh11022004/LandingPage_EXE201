import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Điều chỉnh đường dẫn
import { FaUserMd, FaEdit } from 'react-icons/fa';

const Experts = () => {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [status, setStatus] = useState('All'); // Filter status
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchExpertsData();
  }, [isAuthenticated, navigate, pageIndex, status]);

  const fetchExpertsData = async (newPageIndex = pageIndex) => {
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
      _ts: Date.now(), // Add timestamp to bypass caching
    });

    if (status !== 'All') {
      queryParams.append('status', status);
    }

    try {
      const response = await fetch(`https://mom-and-baby-e7dnhsgjcpgdb8cc.southeastasia-01.azurewebsites.net/api/expert?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Experts API Response Status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
        console.log('Experts API Response Data:', JSON.stringify(responseData, null, 2)); // Log full response with formatting
      } catch (e) {
        console.error('Error parsing experts response:', e);
        responseData = {};
      }

      if (response.ok) {
        if (Array.isArray(responseData)) {
          setExperts(responseData);
        } else if (responseData.items && Array.isArray(responseData.items)) {
          setExperts(responseData.items);
          setTotalPagesCount(responseData.totalPagesCount || 1);
          setHasNext(responseData.next || false);
          setHasPrevious(responseData.previous || false);
        } else {
          console.warn('Experts data is not an array or missing items:', JSON.stringify(responseData, null, 2));
          setExperts([]);
          setErrorMessage('No experts found in the response.');
        }
        setIsLoading(false);
      } else {
        let errorMsg = 'Failed to fetch experts';
        if (response.status === 404) {
          errorMsg = 'Expert endpoint not found. Please check the backend server.';
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
      console.error('Fetch experts error:', error);
      setErrorMessage('Network error while fetching experts. Please try again.');
      setExperts([]);
      setIsLoading(false);
    }
  };

  const updateExpertStatus = async (id, status) => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Prepare the URL with status as a query parameter
    const queryParams = new URLSearchParams({ status: status === 'Baned' ? 'Banned' : status });
    const url = `https://mom-and-baby-e7dnhsgjcpgdb8cc.southeastasia-01.azurewebsites.net/api/admin/expert/${id}?${queryParams}`;

    try {
      console.log('Sending Update Request - URL:', url);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Optionally send an empty body or the full object if required
        body: JSON.stringify({ id: id }), // Minimal body, adjust if backend requires more
      });

      console.log('Update Expert API Response Status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
        console.log('Update Expert API Response Data:', JSON.stringify(responseData, null, 2)); // Log full response with formatting
      } catch (e) {
        console.error('Error parsing update response:', e);
        responseData = {};
      }

      if (response.ok) {
        setErrorMessage('Expert status updated successfully!');
        fetchExpertsData(); // Refresh the list
        setIsUpdateModalOpen(false);
      } else {
        let errorMsg = 'Failed to update expert status';
        if (response.status === 404) {
          errorMsg = 'Expert not found.';
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        } else {
          errorMsg = responseData.message || `Error ${response.status}: ${responseData.detail || 'Unknown error'}`;
        }
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error('Update experts error:', error);
      setErrorMessage('Network error while updating expert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateModal = (expert) => {
    setSelectedExpert(expert);
    setNewStatus(expert.status || 'Pending'); // Ensure newStatus is set to current status
    setIsUpdateModalOpen(true);
    console.log('Opening Modal for Expert:', expert.id, 'Current Status:', expert.status); // Debug log
  };

  const handleUpdateSubmit = () => {
    if (!selectedExpert || !newStatus) {
      setErrorMessage('Please select a status');
      return;
    }
    console.log('Submitting Update - New Status:', newStatus); // Debug log
    updateExpertStatus(selectedExpert.id, newStatus);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setPageIndex(1);
              setStatus(e.target.value);
              console.log('Filter Status Changed to:', e.target.value); // Debug log
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="Active">Active</option>
            <option value="Baned">Banned</option>
            <option value="Deleted">Deleted</option>
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 text-red-500 bg-red-100 p-4 rounded-lg text-center">{errorMessage}</div>
      )}
      {isLoading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : experts.length === 0 ? (
        <div className="text-center text-gray-600 bg-white p-6 rounded-xl shadow-lg">No experts found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-pink-50 text-pink-600">
                <th className="p-4 text-left font-semibold">Degree</th>
                <th className="p-4 text-left font-semibold">Workplace</th>
                <th className="p-4 text-left font-semibold">Description</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experts.map((expert) => (
                <motion.tr
                  key={expert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-4 text-gray-700">{expert.degree || 'N/A'}</td>
                  <td className="p-4 text-gray-700">{expert.workplace || 'N/A'}</td>
                  <td className="p-4 text-gray-600 truncate max-w-xs">{expert.description || 'No description'}</td>
                  <td className="p-4 text-gray-700">{expert.status || 'N/A'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => openUpdateModal(expert)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <FaEdit /> <span className="hidden md:inline">Update</span>
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
          onClick={() => fetchExpertsData(pageIndex - 1)}
          disabled={!hasPrevious}
          className={`px-5 py-2 rounded-lg text-white transition duration-200 ${
            hasPrevious ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700">Page {pageIndex} of {totalPagesCount}</span>
        <button
          onClick={() => fetchExpertsData(pageIndex + 1)}
          disabled={!hasNext}
          className={`px-5 py-2 rounded-lg text-white transition duration-200 ${
            hasNext ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>

      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-pink-800 mb-4">Update Expert Status</h3>
            <p className="text-gray-600 mb-4">Expert: {selectedExpert?.degree || 'N/A'}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => {
                  setNewStatus(e.target.value);
                  console.log('New Status Selected:', e.target.value); // Debug log
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="Active">Active</option>
                <option value="Baned">Banned</option>
                <option value="Deleted">Deleted</option>
                <option value="Pending">Pending</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            {errorMessage && <div className="mb-4 text-red-500 bg-red-100 p-3 rounded-lg text-center">{errorMessage}</div>}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experts;