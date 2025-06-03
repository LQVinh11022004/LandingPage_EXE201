import React from 'react';
import { motion } from 'framer-motion';

const Download = () => {
  return (
    <section id="download" className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-pink-800 mb-6"
        >
          Tải Ứng Dụng Mẹ & Bé Shop Ngay!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          Khám phá nhật ký mẹ bầu, kết nối với bác sĩ, và đọc blog hữu ích ngay trên ứng dụng của bạn!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a
            href="/apk/app-release.apk"
            download
            className="inline-block bg-pink-500 text-white font-semibold py-3 px-8 rounded-full hover:bg-pink-600 transition transform hover:scale-105"
          >
            Tải Ngay
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-sm text-gray-500"
        >
          <p>Phiên bản 1.0.0 | Kích thước: 50MB | Cập nhật: 02/06/2025</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Download;