import React from 'react';
import MapComponent from './components/MapComponent';
import './App.css';
import Header from './components/Header';

function App() {
  return (
    <div className="App">
     <Header></Header>
      <main>
        <MapComponent />
      </main>
    </div>
  );
}

export default App;
