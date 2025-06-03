import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="home" className="bg-gradient-to-r from-pink-300 to-rose-400 text-white py-20">
      <div className="container mx-auto text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          Yêu Thương Bé & Mẹ
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl mb-6"
        >
          Sản phẩm an toàn, chất lượng cho hành trình làm mẹ và tuổi thơ của bé.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white text-pink-600 font-semibold py-2 px-6 rounded-full hover:bg-pink-100 transition"
        >
          Khám Phá Ngay
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;