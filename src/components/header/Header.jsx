import React from 'react'; // Eliminamos useState y useEffect si no hay efecto scroll
import NavBar from './NavBar';
import Menu from '../Menu'; // Mantenemos el menú móvil
import { Link } from 'react-router-dom';

const Header = () => {
  // Sin lógica de scroll aquí

  return (
    <>
      <Menu />
      {/* Header para Desktop (se ocultará en móvil vía CSS) */}
      <header className='header'> {/* Sin clase 'scrolled' */}
        <Link to="/" className='header-logo-link' aria-label="Ir a la página de inicio">
             <div className='header-logo'></div>
        </Link>
        <NavBar />
      </header>
    </>
  );
};

export default Header;