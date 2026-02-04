import React, { useEffect, useRef } from 'react'; // Import useRef
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios'; // Import axios

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user } = useAuth(); // Also get 'user' to check if already logged in
  const processed = useRef(false); // Use a ref to track if the exchange has been processed

  useEffect(() => {
    // console.log("AuthCallback: useEffect running. Location:", location);
    // If the user is already logged in, no need to process the callback again
    if (user && processed.current) { // Check user and processed ref
      // console.log("AuthCallback: User already logged in or already processed, redirecting to home.");
      navigate('/', { replace: true });
      return;
    }

    const params = new URLSearchParams(location.search); // Use location.search for query params
    const code = params.get('code');
    const state = params.get('state'); // Original frontend path

    // console.log("AuthCallback: Code:", code ? code.substring(0, 10) + '...' : 'null', "State:", state);

    // Prevent re-processing if already handled and URL still contains code/state
    if (processed.current) {
        // console.log("AuthCallback: Already processed this callback, preventing re-execution.");
        return;
    }

    if (code) {
      processed.current = true; // Mark as processed to prevent re-execution

      const exchangeCodeForToken = async () => {
        try {
          // console.log("AuthCallback: Exchanging code for token with backend.");
          // Call backend endpoint to exchange code for our app's JWT
          const response = await axios.get(`/api/auth/google/exchange-code?code=${code}&state=${state}`);
          const { token } = response.data; // Assuming backend returns { token: "..." }

          // console.log("AuthCallback: Received response from backend. Token (first 10 chars):", token ? token.substring(0, 10) + '...' : 'null');

          if (token) {
            login(token); // Call login from AuthContext (without navigate)
            // After successful login and state update, navigate to the original destination or home
            // console.log("AuthCallback: Login successful, navigating to:", state || '/');
            navigate(state || '/', { replace: true }); // Use replace to avoid history stack issues
          } else {
            console.error('AuthCallback: No se encontró el JWT del backend.');
            navigate('/#error=backend_token_missing', { replace: true }); // Show specific error
          }
        } catch (error) {
          console.error('AuthCallback: Error al intercambiar código por token:', error.response ? error.response.data : error.message);
          const errorMessage = error.response && error.response.data && error.response.data.message;
          navigate(`/#error=${encodeURIComponent(errorMessage || 'authentication_failed')}`, { replace: true });
        }
      };
      exchangeCodeForToken();
    } else {
      // console.log("AuthCallback: No authorization code found in URL. Checking for errors.");
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
        navigate(`/#error=${encodeURIComponent(errorMsg)}`, { replace: true });
      } else {
        console.error('AuthCallback: No se encontró el código de autorización en la URL de callback.');
        navigate('/', { replace: true });
      }
    }
  }, [location, navigate, login, user]); // Added user to dependencies

  return (
    <div>
      <p>Autenticando...</p>
    </div>
  );
};

export default AuthCallback;