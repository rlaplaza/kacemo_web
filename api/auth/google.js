const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// Environment Variables (from Vercel)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'; // For local testing

// Our hardcoded list of authorized emails for the prototype
const AUTHORIZED_EMAILS = [
  'laplazasolanas@gmail.com', // <<-- IMPORTANT: Replace with actual authorized Google email addresses
  // Add more authorized emails here
];

// Initialize Google OAuth2 Client
const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${VERCEL_URL}/api/auth/google/callback` // Authorized redirect URI
);

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(204).end();
    return;
  }

  const { code, state } = req.query; // 'code' for callback, 'state' for redirect URL

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !JWT_SECRET) {
    console.error('Missing environment variables for Google OAuth or JWT.');
    return res.status(500).json({ message: 'Server configuration error: Missing environment variables for Google OAuth or JWT.' });
  }
  
  // Log the generated redirect URI for debugging
  console.log('VERCEL_URL:', VERCEL_URL);
  console.log('Generated Redirect URI:', `${VERCEL_URL}/api/auth/google/callback`);


  // Handle Google OAuth Callback
  if (code) {
    try {
      // Log the received code
      console.log('Received OAuth code:', code);

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
      
      console.log('Authenticated User Email:', userEmail);

      // Check if user is authorized
      if (!AUTHORIZED_EMAILS.includes(userEmail)) {
        console.warn('Unauthorized user attempt:', userEmail);
        return res.status(403).send(`<h1>Access Denied</h1><p>Your email (${userEmail}) is not authorized to access this application.</p><p><a href="/">Go to Home</a></p>`);
      }

      // Generate a custom JWT for our application
      const appToken = jwt.sign(
        { userId: userId, email: userEmail, name: userName },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
      
      console.log('Generated App JWT for user:', userEmail);

      // Redirect back to frontend, passing the appToken (e.g., in query param or fragment)
      const redirectFrontendUrl = state || '/'; // Use 'state' for frontend redirect
      console.log('Redirecting to frontend with token:', `${redirectFrontendUrl}#token=${appToken.substring(0, 10)}...`); // Log partial token
      return res.redirect(`${redirectFrontendUrl}#token=${appToken}`);

    } catch (error) {
      console.error('Error during Google OAuth callback:', error);
      return res.status(500).send('Authentication failed.');
    }
  } else {
    // Initiate Google OAuth Flow (frontend will call this with a redirect URL in 'state')
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
      prompt: 'consent', // Ensures refresh token is re-issued
      state: state || '/' // Pass original frontend URL to redirect back to
    });
    console.log('Initiating Google OAuth flow. Auth URL:', authUrl);
    return res.redirect(authUrl);
  }
};