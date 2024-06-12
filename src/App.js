import React from 'react';
import Header from './Header';
import GoogleMap from './GoogleMap';
import SurveyForm from './SurveyForm';

const App = () => {
  return (
    <div>
     
      <Header></Header>
      <GoogleMap />
      <SurveyForm />
    </div>
  );
};

export default App;
