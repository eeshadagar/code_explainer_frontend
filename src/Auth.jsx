import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css'; // Import the new CSS file

function Auth({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get current theme from localStorage to apply to body
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Apply theme class to the body element when Auth component is rendered
  useEffect(() => {
    document.body.className = currentTheme + '-theme'; // Apply 'light-theme' or 'dark-theme'
  }, [currentTheme]);

  const handleAuth = async (endpoint) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}`, { username, password });
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        setIsLoggedIn(true);
        alert(`${isRegister ? 'Registration' : 'Login'} successful!`);
      } else {
        setError(res.data.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.response?.data?.message || 'An error occurred during authentication. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      handleAuth('register');
    } else {
      handleAuth('login');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? 'Register to Code Chat Companion ✨' : 'Login to Code Chat Companion ✨'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      <p className="auth-switch-link">
        {isRegister ? "Already have an account?" : "Don't have an account?"}
        <button type="button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
}

export default Auth;
