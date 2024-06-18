import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <img src={require('../images/forstar.png')} alt="Förskolekollen" className="header-image" />
    </header>
  );
};

export default Header;
