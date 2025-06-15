import React from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai'; // cho Success

export default function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <AiOutlineCheckCircle className="w-16 h-16 text-pink-400 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-pink-600">Thanh toán thành công!</h1>
        <p className="text-gray-600 mt-2">Cảm ơn bạn đã tin tưởng và lựa chọn sản phẩm dành cho mẹ và bé.</p>
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
