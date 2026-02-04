import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const logout = useCallback((navigate) => {
    console.log("AuthContext: Performing logout.");
    sessionStorage.removeItem('app_jwt_token');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    if (navigate) navigate('/');
  }, []);

  const login = useCallback((jwtToken) => { // Removed 'navigate' parameter
    console.log("AuthContext: login called with token (first 10 chars):", jwtToken ? jwtToken.substring(0, 10) : 'null');
    sessionStorage.setItem('app_jwt_token', jwtToken);
    try {
      const decodedUser = jwtDecode(jwtToken);
      console.log("AuthContext: Decoded user:", decodedUser);
      setUser(decodedUser);
      setToken(jwtToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      // Removed navigate here: if (navigate) navigate('/');
    } catch (error) {
      console.error("AuthContext: Error decoding JWT during login:", error);
      logout(); // Call logout without navigate
    }
  }, [logout]); // logout is a dependency because it's called internally

  useEffect(() => {
    console.log("AuthContext: useEffect running for initial token check.");
    const storedToken = sessionStorage.getItem('app_jwt_token');
    if (storedToken) {
      console.log("AuthContext: Stored token found (first 10 chars):", storedToken.substring(0, 10));
      try {
        const decodedUser = jwtDecode(storedToken);
        console.log("AuthContext: Decoded user from stored token:", decodedUser);
        if (decodedUser.exp * 1000 < Date.now()) {
          console.log('AuthContext: Stored token expired.');
          logout(); // Call logout (without navigate as useEffect doesn't navigate)
        } else {
          setUser(decodedUser);
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          console.log("AuthContext: User and token set from stored token.");
        }
      } catch (error) {
        console.error('AuthContext: Failed to decode stored token:', error);
        logout(); // Call logout (without navigate)
      }
    } else {
      console.log("AuthContext: No stored token found.");
    }
  }, [logout]); // logout is a dependency

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);