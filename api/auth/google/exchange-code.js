const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { AUTHORIZED_EMAILS } = require('../../auth'); // Corrected import path (auth.js is now in api/)

// Environment Variables (from Vercel)
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS'); // This endpoint only expects GET from frontend
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(204).end();
    return;
  }

  // This endpoint expects a GET request from the frontend
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

    // Check if user is authorized
    if (!AUTHORIZED_EMAILS.includes(userEmail)) {
      console.warn('Unauthorized user attempt:', userEmail);
      // Redirect to frontend error page or display error
      const redirectFrontendUrl = state || '/';
      return res.redirect(`${redirectFrontendUrl}#error=access_denied&email=${userEmail}`);
    }

    // Generate a custom JWT for our application
    const appToken = jwt.sign(
      { userId: userId, email: userEmail, name: userName },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Redirect back to frontend, passing the appToken in fragment
    const redirectFrontendUrl = state || '/'; // Use 'state' for frontend redirect
    console.log('Generated App JWT for user:', userEmail);
    return res.redirect(`${redirectFrontendUrl}#token=${appToken}`);

  } catch (error) {
    console.error('Error during Google OAuth code exchange:', error);
    // Redirect to frontend error page
    const redirectFrontendUrl = state || '/';
    return res.redirect(`${redirectFrontendUrl}#error=authentication_failed`);
  }
};