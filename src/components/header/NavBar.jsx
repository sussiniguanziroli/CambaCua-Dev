import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'nav-button active' : 'nav-button';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };


  return (
    <nav className='nav-bar'>
      <div className='nav-links'>
        <NavLink className={getNavLinkClass} to="/">Inicio</NavLink>
        <NavLink className={getNavLinkClass} to="/productos">Tienda</NavLink>
        <NavLink className={getNavLinkClass} to="/contacto">Contacto</NavLink>
        <NavLink className={getNavLinkClass} to="/miscompras">Mis Compras y Perfil</NavLink>
      </div>
      <div className='auth-links'>
        {currentUser ? (
          <>
            <span className='welcome-user'>Hola, {currentUser.displayName}</span>
            <button onClick={handleLogout} className='auth-button-logout'>Salir</button>
          </>
        ) : (
          <NavLink className='auth-button-login' to="/auth">Ingresar</NavLink>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
