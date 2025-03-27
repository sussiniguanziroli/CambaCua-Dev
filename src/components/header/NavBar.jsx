import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className='nav-bar'>
      <div className='nav-div'>
        <NavLink className="nav-button" activeclassname="active" to="/" >Inicio</NavLink>
      </div>
      <div className='nav-div'>
        <NavLink className="nav-button" activeclassname="active" to="/productos" >Tienda</NavLink>
      </div>
      <div className='nav-div'>
        <NavLink className="nav-button" activeclassname="active" to="/contacto" >Contacto</NavLink>
      </div>
      <div className='nav-div'>
        <NavLink className="nav-button" activeclassname="active" to={`/miscompras`} >Mis Compras</NavLink>
      </div>
    </nav>
  );
};

export default NavBar;
