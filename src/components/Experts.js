import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Điều chỉnh đường dẫn
import { FaUserMd } from 'react-icons/fa';

const Experts = () => {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchExpertsData();
  }, [isAuthenticated, navigate, pageIndex]);

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
    });

    try {
      const response = await fetch(`https://localhost:7015/api/expert?${queryParams}`, {
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
          console.warn('Experts data is not an array:', responseData);
          setExperts([]);
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

  return (
    <div className="p-6">
      {errorMessage && (
        <div className="mb-4 text-red-500 bg-red-100 p-4 rounded-lg text-center">{errorMessage}</div>
      )}
      {isLoading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : experts.length === 0 ? (
        <div className="text-center text-gray-600 bg-white p-6 rounded-xl shadow-lg">No experts found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-pink-50 text-pink-600">
                <th className="p-4 text-left font-semibold">Degree</th>
                <th className="p-4 text-left font-semibold">Workplace</th>
                <th className="p-4 text-left font-semibold">Description</th>
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
                  <td className="p-4 text-gray-600 truncate">{expert.description || 'No description'}</td>
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
    </div>
  );
};

export default Experts;