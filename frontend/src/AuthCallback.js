import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.hash.substring(1)); // Parse fragment (e.g., #token=...)
    const token = params.get('token');

    if (token) {
      login(token);
    } else {
      // Handle error or no token case
      console.error('No token found in callback URL.');
      navigate('/'); // Redirect to home or error page
    }
  }, [location, navigate, login]);

  return (
    <div>
      <p>Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
