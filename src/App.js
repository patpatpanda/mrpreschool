import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import MapComponent from './components/MapComponent';
//import Header from './components/Header';
import theme from './components/theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
      
        <main>
          <MapComponent />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
