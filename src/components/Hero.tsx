import { motion } from 'framer-motion';
import { personalInfo } from '@/lib/mockData';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              你好，我是{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                {personalInfo.name}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-6">{personalInfo.title}</p>
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto md:mx-0">
              {personalInfo.bio}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a 
                href="#projects"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>查看我的项目</span>
                <i className="fa-solid fa-arrow-right"></i>
              </a>
              <a 
                href={personalInfo.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-full transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-github"></i>
                <span>GitHub</span>
              </a>
            </div>
            
            {/* Social Links */}
            <div className="flex justify-center md:justify-start gap-6 mt-12">
              {Object.entries(personalInfo.socialLinks).map(([key, url]) => (
                <a 
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                  aria-label={key}
                >
                  {key === 'github' && <i className="fa-brands fa-github"></i>}
                  {key === 'linkedin' && <i className="fa-brands fa-linkedin"></i>}
                  {key === 'twitter' && <i className="fa-brands fa-twitter"></i>}
                  {key === 'dribbble' && <i className="fa-brands fa-dribbble"></i>}
                </a>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
              {/* Profile Image */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden border-4 border-gray-800 shadow-2xl transform rotate-3 transition-transform hover:rotate-0 duration-500">
                 <img 
                    src="https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Portrait%20of%20a%20handsome%20Asian%20male%20software%20engineer%20wearing%20glasses%2C%20looking%20at%20computer%2C%20hands%20working%20on%20keyboard%2C%20professional%20appearance&sign=d4ff91e738eda1d0187c7ce7d107512e" 
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-600 rounded-2xl -z-10 transform rotate-12"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-purple-600 rounded-2xl -z-10 transform -rotate-12"></div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-gray-500"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">向下滚动</span>
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;