import { personalInfo } from '@/lib/mockData';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-950 border-t border-gray-900 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          <div className="text-center md:text-left">
            <a href="#" className="text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              <i className="fa-brands fa-github text-2xl"></i>
              <span>{personalInfo.name}</span>
            </a>
            <p className="text-gray-400 mt-2 max-w-xs mx-auto md:mx-0">
              {personalInfo.title} - 构建现代化的Web应用
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center gap-6">
              {Object.entries(personalInfo.socialLinks).map(([key, url]) => (
                <a 
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
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
          
          <div className="text-center md:text-right">
            <p className="text-gray-400">
              &copy; {currentYear} {personalInfo.name}. 保留所有权利。
            </p>
            <a href="#" className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-block">
              隐私政策
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;