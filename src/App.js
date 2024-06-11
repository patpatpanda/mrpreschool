import React from 'react';
import GoogleMap from './GoogleMap';
import SurveyForm from './SurveyForm';

const App = () => {
  return (
    <div>
      <h5>Fråga mig om förskola (2023)</h5>
      <GoogleMap />
      <SurveyForm />
    </div>
  );
};

export default App;
