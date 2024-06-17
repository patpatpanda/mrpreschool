import './App.css';
import React from 'react';
import Header from './components/Header';
import GoogleMap from './components/GoogleMap';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="app">
      <Header />
      <GoogleMap />
      <Footer />
    </div>
  );
};

export default App;
