import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios'; // Import axios

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search); // Use location.search for query params
    const code = params.get('code');
    const state = params.get('state'); // Original frontend path

    if (code) {
      const exchangeCodeForToken = async () => {
        try {
          // Call backend endpoint to exchange code for our app's JWT
          const response = await axios.get(`/api/auth/google/exchange-code?code=${code}&state=${state}`);
          const { token } = response.data; // Assuming backend returns { token: "..." }

          if (token) {
            login(token, navigate); // Pass token and navigate
          } else {
            console.error('No se encontró el JWT del backend.');
            navigate('/'); // Redirect to home or error page
          }
        } catch (error) {
          console.error('Error al intercambiar código por token:', error.response ? error.response.data : error.message);
          // Redirect to home or display error based on backend response
          const errorMessage = error.response && error.response.data && error.response.data.message;
          navigate(`/#error=${errorMessage || 'authentication_failed'}`);
        }
      };
      exchangeCodeForToken();
    } else {
      // Check for errors from backend redirect (e.g., access_denied)
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
        console.error('No se encontró el código de autorización en la URL de callback.');
        navigate('/'); // Redirect to home or error page
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