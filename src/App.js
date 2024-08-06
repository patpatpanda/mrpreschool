import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapComponent from './components/MapComponent';

import theme from './components/theme';

import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <nav>
            {/* Lägg till din navigering här */}
          </nav>
          <main>
            <Routes>
              <Route path="/" element={<MapComponent />} />
              <Route path="/forskolan/:id" element={<MapComponent />} />
             
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
