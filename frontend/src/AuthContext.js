import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const logout = useCallback((navigate) => {
    sessionStorage.removeItem('app_jwt_token');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    if (navigate) navigate('/'); // Navigate if provided
  }, []);

  const login = useCallback((jwtToken, navigate) => {
    sessionStorage.setItem('app_jwt_token', jwtToken);
    const decodedUser = jwtDecode(jwtToken);
    setUser(decodedUser);
    setToken(jwtToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    if (navigate) navigate('/'); // Navigate if provided
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('app_jwt_token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        if (decodedUser.exp * 1000 < Date.now()) {
          console.log('Token expired.');
          // logout here without navigate, let the consumer handle navigation
          sessionStorage.removeItem('app_jwt_token');
          setUser(null);
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
        } else {
          setUser(decodedUser);
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        // logout here without navigate, let the consumer handle navigation
        sessionStorage.removeItem('app_jwt_token');
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
      }
    }
  }, []); // useEffect dependency array changed to empty, as logout is not directly called here anymore

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
