import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'; // Import useCallback
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Define logout using useCallback to make it stable
  const logout = useCallback(() => {
    sessionStorage.removeItem('app_jwt_token');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  }, [navigate]); // navigate is stable when passed from useNavigate

  // Define login using useCallback to make it stable
  const login = useCallback((jwtToken) => {
    sessionStorage.setItem('app_jwt_token', jwtToken);
    const decodedUser = jwtDecode(jwtToken);
    setUser(decodedUser);
    setToken(jwtToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    navigate('/');
  }, [navigate]); // navigate is stable

  useEffect(() => {
    const storedToken = sessionStorage.getItem('app_jwt_token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        if (decodedUser.exp * 1000 < Date.now()) {
          console.log('Token expired.');
          logout();
        } else {
          setUser(decodedUser);
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        logout();
      }
    }
  }, [logout]); // logout is now a stable function

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
