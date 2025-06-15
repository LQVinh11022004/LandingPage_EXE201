import React from 'react';
import { AiOutlineCloseCircle } from 'react-icons/ai'; // cho Cancel

export default function Cancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <AiOutlineCloseCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-red-500">Thanh toán thất bại!</h1>
        <p className="text-gray-600 mt-2">Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.</p>
        <a
          href="/"
          className="mt-6 inline-block bg-pink-400 hover:bg-pink-500 text-white font-medium py-2 px-6 rounded-full transition"
        >
          Quay về trang chủ
        </a>
      </div>
    </div>
  );
}
