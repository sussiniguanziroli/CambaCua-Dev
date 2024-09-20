import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import Menu from '../Menu';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
          if (window.scrollY > 70) {
            setScrolled(true); // Se activa cuando el usuario ha hecho scroll hacia abajo
          } else {
            setScrolled(false); // Se desactiva cuando el usuario vuelve hacia arriba
          }
        };
    
        window.addEventListener('scroll', handleScroll);
    
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);
  return (
    <>
      <Menu />
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className='header-logo'></div>
        <NavBar />
      </header>
    </>
  );
};

export default Header;
