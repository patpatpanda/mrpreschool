import React, { useState } from 'react';
import axios from 'axios';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Submitting form with email:', email, 'and password:', password); // För felsökning

    try {
      const response = await axios.post('https://masterkinder20240523125154.azurewebsites.net/api/account/login', { email, password });
      console.log('Login successful:', response.data);
      // Redirect or update state to indicate the user is logged in
      // För exempel, du kan redirecta till hemsidan eller dashboard
      // window.location.href = '/';
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Login failed. Please check your email and password.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </form>
  );
};

export default LoginComponent;
