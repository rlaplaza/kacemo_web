import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { jwtDecode } from 'jwt-decode';

const AuthInitializer = ({ children }) => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('app_jwt_token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        if (decodedUser.exp * 1000 < Date.now()) {
          console.log('Token expired or invalid on startup.');
          logout(navigate); // Pass navigate to logout
        } else {
          // If token exists and is valid, set it in context if not already
          login(storedToken, navigate); // Pass token and navigate to login
        }
      } catch (error) {
        console.error('Failed to decode token on startup:', error);
        logout(navigate); // Pass navigate to logout
      }
    }
  }, [login, logout, navigate]); // Dependencies for useEffect

  return <>{children}</>;
};

export default AuthInitializer;
