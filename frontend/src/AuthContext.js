import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios'; // Import axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

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
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Set Axios default header
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        logout();
      }
    }
  }, [logout]); // Add logout to the dependency array

  const login = (jwtToken) => {
    sessionStorage.setItem('app_jwt_token', jwtToken);
    const decodedUser = jwtDecode(jwtToken);
    setUser(decodedUser);
    setToken(jwtToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`; // Set Axios default header
    navigate('/');
  };

  const logout = () => {
    sessionStorage.removeItem('app_jwt_token');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization']; // Remove Axios default header
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);