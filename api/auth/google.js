const { OAuth2Client } = require('google-auth-library');

// Environment Variables (from Vercel)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// OAUTH_FRONTEND_CALLBACK_URI should point to our frontend route /auth/callback
// e.g., https://kacemo-web.vercel.app/auth/callback
const OAUTH_FRONTEND_CALLBACK_URI = process.env.OAUTH_FRONTEND_CALLBACK_URI || 'http://localhost:3000/auth/callback';

// Initialize Google OAuth2 Client to generate the auth URL
const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  null, // No client secret needed here as we are only generating auth URL
  OAUTH_FRONTEND_CALLBACK_URI // This is where Google will redirect to AFTER user authentication
);

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(204).end();
    return;
  }

  // This endpoint is only for initiating the OAuth flow (GET request from frontend)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!GOOGLE_CLIENT_ID || !OAUTH_FRONTEND_CALLBACK_URI) {
    console.error('Missing environment variables for Google OAuth.');
    return res.status(500).json({ message: 'Server configuration error: Missing Google Client ID or Frontend Callback URI.' });
  }

  // The 'state' parameter will carry the frontend URL where the app should redirect after successful login
  const { state } = req.query;

  // Initiate Google OAuth Flow
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    prompt: 'consent', // Ensures refresh token is re-issued
    state: state || '/' // Pass original frontend URL to redirect back to
  });

  console.log('Initiating Google OAuth flow. Auth URL:', authUrl);
  return res.redirect(authUrl);
};