import React from 'react';
import { motion } from 'framer-motion';

const AccountsTable = ({ accounts, isLoading, errorMessage, pageIndex, totalPagesCount, hasPrevious, hasNext, fetchAccountData, openUpdateModal }) => {
  return (
    <div className="max-w-6xl mx-auto">
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
  );
};

export default AccountsTable;