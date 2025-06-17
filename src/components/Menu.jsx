import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Menu = () => {
  const [burger_class, setBurgerClass] = useState('burger-bar unclicked');
  const [menu_class, setMenuClass] = useState('menu hidden');
  const [isMenuClicked, setIsMenuClicked] = useState(false);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const updateMenu = () => {
    if (!isMenuClicked) {
      setBurgerClass('burger-bar clicked');
      setMenuClass('menu slide-right visible');
    } else {
      setBurgerClass('burger-bar unclicked');
      setMenuClass('menu slide-left hidden');
    }
    setIsMenuClicked(!isMenuClicked);
  };

  const closeMenu = () => {
    setBurgerClass('burger-bar unclicked');
    setMenuClass('menu slide-left hidden');
    setIsMenuClicked(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      navigate('/auth');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  useEffect(() => {
    if (isMenuClicked) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuClicked]);

  return (
    <div className='burger-god'>
      <nav className='nav-burger'>
        <div className='burger-menu' onClick={updateMenu}>
          <div className={burger_class}></div>
          <div className={burger_class}></div>
          <div className={burger_class}></div>
        </div>
        <NavLink to="/" className='menu-logo-camba' onClick={closeMenu}></NavLink>
      </nav>

      <div className={menu_class}>
        <div className="burger-nav-menu">
          {currentUser ? (
            <div className="menu-profile-section">
              <FaUserCircle className="menu-profile-icon" />
              <span className="menu-profile-email">{currentUser.displayName}</span>
              <button onClick={handleLogout} className="menu-logout-button">
                <FaSignOutAlt /> Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="menu-profile-section">
               <NavLink to="/auth" className="menu-login-button" onClick={closeMenu}>
                Ingresar / Registrarse
              </NavLink>
            </div>
          )}

          <ul className="burger-nav-ul">
            <li>
              <NavLink onClick={closeMenu} to="/" className="burger-nav-item" activeclassname="burger-active">
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeMenu} to="/productos" className="burger-nav-item" activeclassname="burger-active">
                Tienda
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeMenu} to="/contacto" className="burger-nav-item" activeclassname="burger-active">
                Contacto
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeMenu} to="/miscompras" className="burger-nav-item" activeclassname="burger-active">
                Mis Compras
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {isMenuClicked && <div className="overlay" onClick={updateMenu}></div>}
    </div>
  );
};

export default Menu;
