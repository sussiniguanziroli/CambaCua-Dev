import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'nav-button active' : 'nav-button';
  };

  return (
    <nav className='nav-bar'>
      <div className='nav-div'>
        <NavLink className={getNavLinkClass} to="/">Inicio</NavLink>
      </div>
      <div className='nav-div'>
        <NavLink className={getNavLinkClass} to="/productos">Tienda</NavLink>
      </div>
      <div className='nav-div'>
        <NavLink className={getNavLinkClass} to="/contacto">Contacto</NavLink>
      </div>
      <div className='nav-div'>
        <NavLink className={getNavLinkClass} to="/miscompras">Mis Compras</NavLink>
      </div>
    </nav>
  );
};

export default NavBar;