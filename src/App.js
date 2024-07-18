import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import BlogComponent from './components/BlogComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import './App.css';
import theme from './components/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <nav>
            <Link to="/">Home</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
          <main>
            <Routes>
              <Route path="/" element={<MapComponent />} />
              <Route path="/blog" element={<BlogComponent />} />
              <Route path="/login" element={<LoginComponent />} />
              <Route path="/register" element={<RegisterComponent />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
