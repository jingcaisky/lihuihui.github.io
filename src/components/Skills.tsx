import { motion } from 'framer-motion';
import { skills } from '@/lib/mockData';

const Skills = () => {
  // Group skills by category
  const groupedSkills = skills.reduce((groups, skill) => {
    const group = groups[skill.category] || [];
    group.push(skill);
    groups[skill.category] = group;
    return groups;
  }, {});

  return (
    <section id="skills" className="py-24 bg-gray-900 relative">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">我的技能</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            作为一名全栈工程师，我掌握了多种技术和工具，能够从前端到后端构建完整的Web应用程序。
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Technical Skills */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <i className="fa-solid fa-code text-white"></i>
              </div>
              技术技能
            </h3>
            
            {Object.entries(groupedSkills).map(([category, skillsInCategory], index) => (
              <div key={category} className="mb-8">
                <h4 className="text-lg font-medium text-blue-400 mb-4">{category}</h4>
                <div className="space-y-4">
                  {skillsInCategory.map((skill, skillIndex) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">{skill.name}</span>
                        <span className="text-blue-400">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: 0.1 * (index + skillIndex) }}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
          
          {/* Technical Expertise */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2">
              <div className="bg-purple-600 p-2 rounded-lg">
                <i className="fa-solid fa-lightbulb text-white"></i>
              </div>
              专业领域
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Expertise Items */}
              {[
                { icon: 'fa-react', name: 'React开发', description: '构建响应式和高性能的单页应用' },
                { icon: 'fa-code', name: '前端开发', description: '创建现代、交互式的用户界面' },
                { icon: 'fa-server', name: '后端开发', description: '设计和实现强大的API和服务' },
                { icon: 'fa-database', name: '数据库设计', description: '优化数据存储和查询性能' },
                { icon: 'fa-paint-brush', name: 'UI设计', description: '创建美观且用户友好的界面' },
                { icon: 'fa-cloud', name: '云服务', description: '部署和扩展云基础设施' },
                { icon: 'fa-mobile-alt', name: '响应式设计', description: '确保跨设备的最佳体验' },
                { icon: 'fa-cogs', name: 'DevOps', description: '自动化部署和监控流程' }
              ].map((item, index) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * index }}
                  viewport={{ once: true }}
                  className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700/50"
                >
                  <div className="text-blue-400 text-xl mb-3">
                    <i className={`fa-brands ${item.icon}`}></i>
                  </div>
                  <h4 className="text-white font-medium mb-1">{item.name}</h4>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Skills;