import React, { useState } from 'react';
import axios from 'axios';

const RegisterComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('https://masterkinder20240523125154.azurewebsites.net/api/account/register', {
        email,
        password,
      });

      if (response.status === 200) {
        console.log('Registration successful!');
        // Handle successful registration (e.g., redirect to login page)
      }
    } catch (err) {
      setError('Registration failed: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default RegisterComponent;
