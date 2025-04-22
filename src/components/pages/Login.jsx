import React from 'react';
import './Login.css';

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign in to PocketSmith</h2>
        <input type="text" placeholder="Username or Email" />
        <input type="password" placeholder="Password" />
        <button className="login-btn">SIGN IN</button>
        <button className="google-login-btn">
          <i className="fab fa-google"></i> Sign in with Google
        </button>
        <p>Forgot your password?</p>
      </div>
    </div>
  );
}

export default Login;
