import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import MapComponent from './components/MapComponent';
import './App.css';
import theme from './components/theme'; // Importera temat

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
