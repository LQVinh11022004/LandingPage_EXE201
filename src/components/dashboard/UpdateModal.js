import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const UpdateModal = ({ selectedAccount, fullName, setFullName, dateOfBirth, setDateOfBirth, sex, setSex, errorMessage, setErrorMessage, setIsUpdateModalOpen, updateAccount }) => {
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

  return (
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
        {errorMessage && (
          <div className="mt-4 text-red-500 bg-red-100 p-4 rounded-lg text-center">{errorMessage}</div>
        )}
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
  );
};

export default UpdateModal;