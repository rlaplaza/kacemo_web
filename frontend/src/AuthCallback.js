import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios'; // Import axios

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    console.log("AuthCallback: useEffect running. Location:", location);
    const params = new URLSearchParams(location.search); // Use location.search for query params
    const code = params.get('code');
    const state = params.get('state'); // Original frontend path

    console.log("AuthCallback: Code:", code ? code.substring(0, 10) + '...' : 'null', "State:", state);

    if (code) {
      const exchangeCodeForToken = async () => {
        try {
          console.log("AuthCallback: Exchanging code for token with backend.");
          // Call backend endpoint to exchange code for our app's JWT
          const response = await axios.get(`/api/auth/google/exchange-code?code=${code}&state=${state}`);
          const { token } = response.data; // Assuming backend returns { token: "..." }

          console.log("AuthCallback: Received response from backend. Token (first 10 chars):", token ? token.substring(0, 10) + '...' : 'null');

          if (token) {
            login(token, navigate); // Pass token and navigate
            console.log("AuthCallback: login function called.");
          } else {
            console.error('AuthCallback: No se encontró el JWT del backend.');
            navigate('/');
          }
        } catch (error) {
          console.error('AuthCallback: Error al intercambiar código por token:', error.response ? error.response.data : error.message);
          const errorMessage = error.response && error.response.data && error.response.data.message;
          navigate(`/#error=${errorMessage || 'authentication_failed'}`);
        }
      };
      exchangeCodeForToken();
    } else {
      console.log("AuthCallback: No authorization code found in URL. Checking for errors.");
      const errorParam = params.get('error');
      if (errorParam) {
        const emailParam = params.get('email');
        let errorMsg = '';
        if (errorParam === 'access_denied') {
          errorMsg = `Acceso Denegado: Tu correo electrónico (${emailParam}) no está autorizado para acceder a esta aplicación.`;
        } else if (errorParam === 'authentication_failed') {
          errorMsg = 'Fallo de autenticación. Por favor, inténtalo de nuevo.';
        } else {
          errorMsg = `Error de autenticación: ${errorParam}`;
        }
        console.error(errorMsg);
        navigate(`/#error=${encodeURIComponent(errorMsg)}`);
      } else {
        console.error('AuthCallback: No se encontró el código de autorización en la URL de callback.');
        navigate('/');
      }
    }
  }, [location, navigate, login]);

  return (
    <div>
      <p>Autenticando...</p>
    </div>
  );
};

export default AuthCallback;
