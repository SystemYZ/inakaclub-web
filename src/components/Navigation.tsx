import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-md py-4 shadow-xl' : 'bg-transparent py-8'}`}>
      <div className="app-container flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif neon-text-pink tracking-tighter">
          いなかくらぶ
        </Link>
        
        <div className="flex gap-8 text-xs tracking-[0.2em] uppercase font-bold">
          <Link 
            to="/" 
            className={`hover:text-amber-500 transition-colors ${location.pathname === '/' ? 'text-amber-500' : 'text-zinc-400'}`}
          >
            Home
          </Link>
          <Link 
            to="/masters-room" 
            className={`hover:text-amber-500 transition-colors ${location.pathname === '/masters-room' ? 'text-amber-500' : 'text-zinc-400'}`}
          >
            Master's Room
          </Link>
          <Link 
            to="/instagram" 
            className={`hover:text-amber-500 transition-colors ${location.pathname === '/instagram' ? 'text-amber-500' : 'text-zinc-400'}`}
          >
            Instagram
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
