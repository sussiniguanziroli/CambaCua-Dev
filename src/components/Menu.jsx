import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Menu = () => {
  // To change burger classes
  const [burger_class, setBurgerClass] = useState('burger-bar unclicked');
  const [menu_class, setMenuClass] = useState('menu hidden');
  const [isMenuClicked, setIsMenuClicked] = useState(false);

  // Toggle burger menu change
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

  // Add or remove no-scroll class to body
  useEffect(() => {
    if (isMenuClicked) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      // Cleanup class on unmount
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuClicked]);

  return (
    <div className="burger-god">
      <nav className="nav-burger">
        <div className="burger-menu" onClick={updateMenu}>
          <div className={burger_class}></div>
          <div className={burger_class}></div>
          <div className={burger_class}></div>
        </div>
        <div className='menu-logo-camba'></div>
      </nav>

      <div className={menu_class}>
        <div className="burger-nav-menu">
          <ul className="burger-nav-ul">
            <li>
              <NavLink
                onClick={closeMenu}
                to="/"
                className="burger-nav-item"
                activeclassname="burger-active"
              >
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink
                onClick={closeMenu}
                to="/productos"
                className="burger-nav-item"
                activeclassname="burger-active"
              >
                Productos
              </NavLink>
            </li>
            <li>
              <NavLink
                onClick={closeMenu}
                to="/contacto"
                className="burger-nav-item"
                activeclassname="burger-active"
              >
                Contacto
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
