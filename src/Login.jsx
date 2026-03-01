import React, { useState } from 'react';
import { Rocket, User, Lock, ArrowRight, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import WebGLBackground from './WebGLBackground';
import InteractiveBackground from './InteractiveBackground';
import './Login.css';

const Login = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Use the same theme as the main app (read from localStorage or default)
  const theme = localStorage.getItem('theme') || 'red-mars';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Retrieve existing users or initialize empty array
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');

      if (isLogin) {
        // Login logic
        const user = existingUsers.find(u => u.username === username);
        if (!user) {
          setError('User not found. Please sign up first.');
        } else if (user.password !== password) {
          setError('Incorrect password.');
        } else {
          // Success
          onLogin(`mock-token-${Date.now()}`, username);
        }
      } else {
        // Register logic
        const userExists = existingUsers.some(u => u.username === username);
        if (userExists) {
          setError('Username already taken. Please choose another.');
        } else {
          // Add new user
          const newUser = { username, password };
          localStorage.setItem('mockUsers', JSON.stringify([...existingUsers, newUser]));
          // Auto-login after successful registration
          onLogin(`mock-token-${Date.now()}`, username);
        }
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    }

    setLoading(false);
  };

  return (
    <div className={`app-container login-container`} data-theme={theme}>
      <WebGLBackground theme={theme} />
      <InteractiveBackground theme={theme} />

      <button className="login-back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
        <span>Back to Editor</span>
      </button>

      <div className="login-overlay">
        <div className="login-card glass-panel stagger-item">
          <div className="login-header">
            <div className="login-logo">
              <Rocket size={32} className="logo-icon bounce-anim" />
            </div>
            <h2><span className="brand-ojas">OJAS</span> Mentor</h2>
            <p className="login-subtitle">
              {isLogin ? 'Welcome back to your command center' : 'Begin your coding journey'}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label><User size={16} /> Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label><Lock size={16} /> Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn primary-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  {isLogin ? 'Engage Thrusters' : 'Initialize Account'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already registered?"}
              <button
                type="button"
                className="toggle-auth-btn"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>

          <div className="login-badges">
            <span className="badge"><ShieldCheck size={12} /> Secure Auth</span>
            <span className="badge"><Zap size={12} /> Fast Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
