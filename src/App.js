import React from 'react';
import Header from './Header';
import GoogleMap from './GoogleMap';
import SurveyForm from './SurveyForm';
import Footer from './Footer';

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
