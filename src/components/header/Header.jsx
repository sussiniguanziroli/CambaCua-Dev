import React from 'react';
import NavBar from './NavBar';
import Menu from '../Menu';

const Header = () => {
  return (
    <>
      <Menu />
      <header className='header'>
        <div className='header-logo'></div>
        <NavBar />
      </header>
    </>
  );
};

export default Header;
