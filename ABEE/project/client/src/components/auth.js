import React, { useState,useEffect } from 'react';

import AgoraUIKit from "agora-react-uikit";

import './LoginForm.css';


function LoginForm({ setLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin(event) {
    event.preventDefault();
    fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(data => {
      if (data === 'Login successful!') {
        setLoggedIn(true);
      } else {
        alert('Invalid username or password');
      }
    })
    .catch(error => console.error(error));
  }

  return (
    <>
  
    <div className="login-form-container">
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input type="text" value={username} onChange={event => setUsername(event.target.value)} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </label>
        <button type="submit">Login</button>
      </form>
      
    </div></>
  );
}

function LogoutButton({ setLoggedIn }) {
  const [videoCall, setVideoCall] = useState(true);
  const rtcProps = {
    appId: "",
    channel: "",
    token: "",
};
const callbacks = {
  EndCall: () => setVideoCall(false),
  
};
  function handleLogout() {
    
    fetch('http://localhost:3001/logout')
    .then(response => response.text())
    .then(data => {
      if (data === 'Logout successful!') {
        setLoggedIn(false);
        setVideoCall(false);
      }
    })
    .catch(error => console.error(error));

    
  }


  return videoCall ? (
    <>
    <div style={{ display: "flex", width: "100vw", height: "80vh" }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div></>
  ) : (
    <>
    <h3 onClick={() => setVideoCall(true)} className='logout'>Join</h3>
    <button onClick={handleLogout} className='logout2'>Logout</button>
    </>
  );
}

function LoginForms() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      {loggedIn ? <LogoutButton setLoggedIn={setLoggedIn} /> : <LoginForm setLoggedIn={setLoggedIn} />}
    </div>
  );
}

export default LoginForms;
