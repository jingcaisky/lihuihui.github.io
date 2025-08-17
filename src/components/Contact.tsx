import { motion } from 'framer-motion';
import { personalInfo } from '@/lib/mockData';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">联系我</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            对我的工作感兴趣？有项目想合作？请随时与我联系，我很乐意听取您的想法。
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-950 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-2xl font-semibold text-white mb-6">联系方式</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">邮箱</h4>
                    <p className="text-gray-400 mb-1">{personalInfo.email}</p>
                    <a 
                      href={`mailto:${personalInfo.email}`}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <span>发送邮件</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400">
                    <i className="fa-brands fa-github"></i>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">GitHub</h4>
                    <p className="text-gray-400 mb-1">{personalInfo.socialLinks.github}</p>
                    <a 
                      href={personalInfo.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <span>查看我的仓库</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400">
                    <i className="fa-brands fa-linkedin"></i>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">LinkedIn</h4>
                    <p className="text-gray-400 mb-1">{personalInfo.socialLinks.linkedin}</p>
                    <a 
                      href={personalInfo.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <span>查看我的档案</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="mt-10">
                <h4 className="text-white font-medium mb-4">关注我</h4>
                <div className="flex gap-4">
                  {Object.entries(personalInfo.socialLinks).map(([key, url]) => (
                    <a 
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white p-3 rounded-full transition-colors"
                      aria-label={key}
                    >
                      {key === 'github' && <i className="fa-brands fa-github"></i>}
                      {key === 'linkedin' && <i className="fa-brands fa-linkedin"></i>}
                      {key === 'twitter' && <i className="fa-brands fa-twitter"></i>}
                      {key === 'dribbble' && <i className="fa-brands fa-dribbble"></i>}
                    </a>
                  ))}
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
            <div className="bg-gray-950 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-2xl font-semibold text-white mb-6">发送消息</h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-300 mb-2 text-sm">姓名</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="您的姓名"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2 text-sm">邮箱</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="您的邮箱"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-gray-300 mb-2 text-sm">主题</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="消息主题"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-300 mb-2 text-sm">消息</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="请输入您的消息..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <span>发送消息</span>
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;