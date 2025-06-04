import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Adjust the path as needed
import { FaTimes, FaPlus } from 'react-icons/fa';

const ServicePackage = () => {
  const [servicePackages, setServicePackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [isDescending, setIsDescending] = useState(null); // Nullable
  const [pagingPackageEnum, setPagingPackageEnum] = useState(null); // Nullable
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(0);
  const [monthlyUsageLimit, setMonthlyUsageLimit] = useState(null);
  const [newName, setNewName] = useState(''); // For create modal

  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchServicePackages();
  }, [isAuthenticated, navigate, pageIndex]);

  const fetchServicePackages = async (newPageIndex = pageIndex) => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append('_pageIndex', newPageIndex.toString());
    queryParams.append('_pageSize', pageSize.toString());
    if (searchString) queryParams.append('searchString', searchString);
    if (isDescending !== null) queryParams.append('isDescending', isDescending.toString());
    if (pagingPackageEnum) queryParams.append('pagingPackageEnum', pagingPackageEnum);

    try {
      const response = await fetch(`https://localhost:7015/api/service-package?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Service Packages API Response Status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Error parsing service packages response:', e);
        responseData = {};
      }

      if (response.ok) {
        if (Array.isArray(responseData)) {
          setServicePackages(responseData);
        } else if (responseData.items && Array.isArray(responseData.items)) {
          setServicePackages(responseData.items);
          setTotalPagesCount(responseData.totalPagesCount || 1);
          setHasNext(responseData.next || false);
          setHasPrevious(responseData.previous || false);
        } else {
          console.warn('Service packages data is not an array:', responseData);
          setServicePackages([]);
        }
        setIsLoading(false);
      } else {
        let errorMsg = 'Failed to fetch service packages';
        if (response.status === 404) {
          errorMsg = 'Service package endpoint not found. Please check the backend server.';
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
      console.error('Fetch service packages error:', error);
      setErrorMessage('Network error while fetching service packages. Please try again.');
      setServicePackages([]);
      setIsLoading(false);
    }
  };

  const createServicePackage = async (body) => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7015/api/service-package`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Create API Response Status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = {};
      }

      if (response.ok) {
        setErrorMessage('Service package created successfully!');
        fetchServicePackages(); // Refresh the table
      } else {
        let errorMsg = 'Failed to create service package';
        if (response.status === 400) {
          errorMsg = responseData.message || 'Invalid data provided';
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
      console.error('Create error:', error);
      setErrorMessage('Network error during creation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateServicePackage = async (id, body) => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7015/api/service-package/${id}`, {
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
        setErrorMessage('Service package updated successfully!');
        fetchServicePackages(); // Refresh the table
      } else {
        let errorMsg = 'Failed to update service package';
        if (response.status === 404) {
          errorMsg = 'Service package endpoint not found.';
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

  const openUpdateModal = (pkg) => {
    setSelectedPackage(pkg);
    setDescription(pkg.description || '');
    setImage(pkg.image || '');
    setPrice(pkg.price || 0);
    setMonthlyUsageLimit(pkg.monthlyUsageLimit || null);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (!description || !image || price < 0) {
      setErrorMessage('Please fill in all required fields with valid values');
      return;
    }

    const body = {
      description,
      image,
      price,
      monthlyUsageLimit,
    };

    updateServicePackage(selectedPackage.id, body);
    setIsUpdateModalOpen(false);
  };

  const openCreateModal = () => {
    setNewName('');
    setDescription('');
    setImage('');
    setPrice(0);
    setMonthlyUsageLimit(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!newName || !description || !image || price < 0) {
      setErrorMessage('Please fill in all required fields with valid values');
      return;
    }

    const body = {
      name: newName,
      description,
      image,
      price,
      monthlyUsageLimit,
      deals: [], // Optional, can be empty array as per example
    };

    createServicePackage(body);
    setIsCreateModalOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchString(e.target.value);
    setPageIndex(1);
  };

  const handleSearchSubmit = () => {
    fetchServicePackages(1);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center space-x-4">
        <input
          type="text"
          value={searchString}
          onChange={handleSearchChange}
          placeholder="Search service packages..."
          className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
        />
        <button
          onClick={handleSearchSubmit}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Search
        </button>
        <button
          onClick={openCreateModal}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center"
        >
          <FaPlus className="mr-2" /> Create New Package
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 text-red-500 bg-red-100 p-4 rounded-lg text-center">{errorMessage}</div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : servicePackages.length === 0 ? (
        <div className="text-center text-gray-600 bg-white p-6 rounded-xl shadow-lg">No service packages found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-pink-50 text-pink-600">
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Description</th>
                <th className="p-4 text-left font-semibold">Price</th>
                <th className="p-4 text-left font-semibold">Monthly Usage Limit</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servicePackages.map((pkg) => (
                <motion.tr
                  key={pkg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-4 text-gray-700">{pkg.name || 'N/A'}</td>
                  <td className="p-4 text-gray-700">{pkg.description || 'N/A'}</td>
                  <td className="p-4 text-gray-600">{pkg.price || '0'}</td>
                  <td className="p-4 text-gray-600">{pkg.monthlyUsageLimit !== null ? pkg.monthlyUsageLimit : 'N/A'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => openUpdateModal(pkg)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mr-2"
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
          onClick={() => fetchServicePackages(pageIndex - 1)}
          disabled={!hasPrevious}
          className={`px-5 py-2 rounded-lg text-white transition duration-200 ${
            hasPrevious ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700">Page {pageIndex} of {totalPagesCount}</span>
        <button
          onClick={() => fetchServicePackages(pageIndex + 1)}
          disabled={!hasNext}
          className={`px-5 py-2 rounded-lg text-white transition duration-200 ${
            hasNext ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>

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
            <h3 className="text-xl font-bold text-pink-800 mb-6">Update Service Package</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Usage Limit (Optional)</label>
                <input
                  type="number"
                  value={monthlyUsageLimit !== null ? monthlyUsageLimit : ''}
                  onChange={(e) => setMonthlyUsageLimit(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                  placeholder="Leave blank for null"
                />
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

      {isCreateModalOpen && (
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
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
            <h3 className="text-xl font-bold text-pink-800 mb-6">Create New Service Package</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Usage Limit (Optional)</label>
                <input
                  type="number"
                  value={monthlyUsageLimit !== null ? monthlyUsageLimit : ''}
                  onChange={(e) => setMonthlyUsageLimit(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                  placeholder="Leave blank for null"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ServicePackage;