import React from 'react';
import Header from './components/Header';
import GoogleMap from './components/GoogleMap';
import SurveyForm from './components/SurveyForm';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="app">
      <Header />
      <GoogleMap />
      <SurveyForm />
      <Footer />
    </div>
  );
};

export default App;
