import { motion } from 'framer-motion';
import { personalInfo } from '@/lib/mockData';

const About = () => {
  return (
    <section id="about" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">关于我</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden">
               <img 
                 src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=Portrait%20of%20a%20handsome%20Asian%20male%20software%20engineer%20wearing%20glasses%2C%20working%20on%20a%20modern%20laptop%20in%20a%20creative%20workspace%2C%20looking%20at%20computer%2C%20professional%20appearance&sign=c0fbbf9a45c5a9cdf4c511fc1ee92a57" 
                 alt={personalInfo.name}
                 className="w-full h-auto rounded-2xl shadow-2xl"
               />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
              
              {/* Stats Overlay */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl">
                    <p className="text-3xl font-bold text-blue-400">5+</p>
                    <p className="text-gray-300 text-sm">年经验</p>
                  </div>
                  <div className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl">
                    <p className="text-3xl font-bold text-blue-400">30+</p>
                    <p className="text-gray-300 text-sm">项目</p>
                  </div>
                  <div className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl">
                    <p className="text-3xl font-bold text-blue-400">10+</p>
                    <p className="text-gray-300 text-sm">技术栈</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-white mb-4">全栈开发者 & UI设计师</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {personalInfo.bio}
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed">
              我热衷于创建既美观又实用的数字产品，注重代码质量和用户体验的平衡。我相信良好的设计应该是直观且有意义的，而优秀的代码应该是可维护且高效的。
            </p>
            
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-lg text-blue-400">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">姓名</p>
                  <p className="text-white">{personalInfo.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-lg text-blue-400">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">邮箱</p>
                  <p className="text-white">{personalInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-lg text-blue-400">
                  <i className="fa-solid fa-briefcase"></i>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">职业</p>
                  <p className="text-white">{personalInfo.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-lg text-blue-400">
                  <i className="fa-solid fa-code"></i>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">专长</p>
                  <p className="text-white">全栈开发</p>
                </div>
              </div>
            </div>
            
            <a 
              href="#contact"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <span>联系我</span>
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;