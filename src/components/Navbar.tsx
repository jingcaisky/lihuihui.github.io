import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { personalInfo } from '@/lib/mockData';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={cn(
      'fixed w-full z-50 transition-all duration-300',
      scrolled ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
    )}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <a href="#" className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fa-brands fa-github text-2xl"></i>
            <span>码界啊辉</span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-white hover:text-blue-400 transition-colors">关于我</a>
            <a href="#skills" className="text-white hover:text-blue-400 transition-colors">技能</a>
            <a href="#projects" className="text-white hover:text-blue-400 transition-colors">项目</a>
            <a href="#contact" className="text-white hover:text-blue-400 transition-colors">联系我</a>
            <a 
              href={personalInfo.socialLinks.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/20"
            >
              GitHub
            </a>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white text-2xl"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <i className="fa-solid fa-times"></i> : <i className="fa-solid fa-bars"></i>}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div className={cn(
          'md:hidden mt-4 overflow-hidden transition-all duration-300 ease-in-out',
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="flex flex-col space-y-4 py-4 bg-black/90 rounded-lg mt-2">
            <a 
              href="#about" 
              className="text-white hover:text-blue-400 transition-colors px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              关于我
            </a>
            <a 
              href="#skills" 
              className="text-white hover:text-blue-400 transition-colors px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              技能
            </a>
            <a 
              href="#projects" 
              className="text-white hover:text-blue-400 transition-colors px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              项目
            </a>
            <a 
              href="#contact" 
              className="text-white hover:text-blue-400 transition-colors px-4 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              联系我
            </a>
            <a 
              href={personalInfo.socialLinks.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-center transition-all"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;