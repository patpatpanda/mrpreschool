import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import './App.css';
import theme from './components/theme'; // Import the theme

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <main>
            <Routes>
              <Route path="/forskolan/:id" element={<MapComponent />} />
              <Route path="/" element={<MapComponent />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
