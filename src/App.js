import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapComponent from './components/MapComponent';

import './App.css';
import theme from './components/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <nav>
            {/* Add your navigation here */}
          </nav>
          <main>
            <Routes>
              <Route path="/" element={<MapComponent />} />
              <Route path="/forskolan/:id" element={<MapComponent />} />
              {/* Add other routes as needed */}
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
