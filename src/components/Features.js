import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    { title: "Nhật Ký Mẹ Bầu", desc: "Ghi lại hành trình mang thai với nhật ký cá nhân hóa, lưu giữ khoảnh khắc đáng nhớ.", icon: "📖" },
    { title: "Kết Nối Với Bác Sĩ", desc: "Liên hệ trực tiếp với bác sĩ để được tư vấn sức khỏe mẹ và bé mọi lúc.", icon: "👩‍⚕️" },
    { title: "Blog Hữu Ích", desc: "Đọc các bài viết chia sẻ kinh nghiệm, mẹo chăm sóc mẹ và bé từ chuyên gia.", icon: "📝" },
  ];

  return (
    <section id="features" className="py-20 bg-pink-50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center text-pink-800 mb-12"
        >
          Tại Sao Chọn Mẹ & Bé Shop?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-pink-700 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;