import React from 'react';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Forskolan Locator</h1>
      </header>
      <main>
        <MapComponent />
      </main>
    </div>
  );
}

export default App;
