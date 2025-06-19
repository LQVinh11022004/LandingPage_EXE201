import React from 'react';
import { motion } from 'framer-motion';

const Download = () => {
  return (
    <section id="download" className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl font-bold text-pink-800 mb-6">
              Tải Ứng Dụng Mẹ & Bé Shop Ngay!
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Khám phá nhật ký mẹ bầu, kết nối với bác sĩ, và đọc blog hữu ích ngay trên ứng dụng của bạn!
            </p>
            <a
              href="/apk/app-release.apk"
              download
              className="inline-block bg-pink-500 text-white font-semibold py-3 px-8 rounded-full hover:bg-pink-600 transition transform hover:scale-105"
            >
              Tải Ngay
            </a>
            <div className="mt-6 text-sm text-gray-500">
              <p>Kích thước: 53.5 MB | Cập nhật: 18/06/2025</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:w-1/2"
          >
            <h3 className="text-xl font-semibold text-pink-700 mb-4">
              Theo dõi chúng tôi trên Facebook!
            </h3>
            <img
              src="./qr.png"
              alt="QR code trang Facebook Mẹ & Bé Shop"
              className="w-full max-w-sm mx-auto rounded-lg"
              loading="lazy"
            />
            <p className="text-gray-600 mt-4 text-lg">
              Quét mã QR để truy cập trang Facebook của Mẹ & Bé Shop và nhận các ưu đãi độc quyền!
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Download;