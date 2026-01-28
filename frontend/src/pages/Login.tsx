// frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import Page from '../components/layout/Page';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await auth.login(email, password);
      navigate('/');
    } catch (err: any) {
      setError('Login failed');
    }
  };

  return (
    <Page title="Login">
      <form onSubmit={handleLogin} style={{ maxWidth: 400 }}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <button type="submit">Login</button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </Page>
  );
};

export default Login;
