import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 Förskolor i Stockholm. All rights reserved.</p>
        <div className="footer-links">
          <a href="/about">Om Oss</a>
          <a href="/contact">Kontakt</a>
          <a href="/privacy">Integritetspolicy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
