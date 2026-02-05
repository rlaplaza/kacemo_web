const { OAuth2Client } = require('google-auth-library');
const { handleCorsPreflight } = require('../cors');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const OAUTH_FRONTEND_CALLBACK_URI = process.env.OAUTH_FRONTEND_CALLBACK_URI || 'http://localhost:3000/auth/callback';

const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  null, 
  OAUTH_FRONTEND_CALLBACK_URI
);

module.exports = async (req, res) => {
  handleCorsPreflight(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!GOOGLE_CLIENT_ID || !OAUTH_FRONTEND_CALLBACK_URI) {
    console.error('Missing environment variables for Google OAuth.');
    return res.status(500).json({ message: 'Server configuration error: Missing Google Client ID or Frontend Callback URI.' });
  }

  const { state } = req.query;

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    prompt: 'consent', // Ensures refresh token is re-issued
    state: state || '/' // Pass original frontend URL to redirect back to
  });

  console.log('Initiating Google OAuth flow. Auth URL:', authUrl);
  return res.redirect(authUrl);
};