const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { handleCorsPreflight } = require('../../cors');
const { userAuthorized } = require('../../auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const OAUTH_FRONTEND_CALLBACK_URI = process.env.OAUTH_FRONTEND_CALLBACK_URI || 'http://localhost:3000/auth/callback'; // Frontend callback URI

// Initialize Google OAuth2 Client
const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  OAUTH_FRONTEND_CALLBACK_URI // Authorized redirect URI
);

module.exports = async (req, res) => {
  handleCorsPreflight(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { code, state } = req.query; // 'code' from Google redirect, 'state' from original frontend URL

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !JWT_SECRET || !OAUTH_FRONTEND_CALLBACK_URI) {
    console.error('Missing environment variables for Google OAuth or JWT.');
    return res.status(500).json({ message: 'Server configuration error: Missing environment variables for Google OAuth or JWT.' });
  }

  if (!code) {
    return res.status(400).json({ message: 'Authorization code missing.' });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload['sub'];
    const userEmail = payload['email'];
    const userName = payload['name'];

    if (!userAuthorized(userEmail)) {
      console.warn('Unauthorized user attempt:', userEmail);
      return res.status(403).json({ message: 'Acceso Denegado: Tu correo electrónico no está autorizado para acceder a esta aplicación.' });
    }

    // Generate a custom JWT for our application
    const appToken = jwt.sign(
      { userId: userId, email: userEmail, name: userName },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    console.log('Generated App JWT for user:', userEmail);
    res.status(200).json({ token: appToken });

  } catch (error) {
    console.error('Error during Google OAuth code exchange:', error);
    res.status(500).json({ message: 'Fallo de autenticación durante el intercambio de código.' });
  }
};
