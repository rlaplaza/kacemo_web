const axios = require('axios');
const jwt = require('jsonwebtoken');
const { AUTHORIZED_EMAILS } = require('./auth'); // Corrected import path (auth.js is now directly in api/) (now in api/auth/auth.js)

const GITHUB_USERNAME = 'rlaplaza';
const GITHUB_REPONAME = 'kacemo_web';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Application's PAT for GitHub API calls
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(204).end();
    return;
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/issues`;

  try {
    // For GET requests (reading events), no authentication is strictly needed,
    // as issues in a public repo are public. However, if a user's token
    // were to be used for private repo access, it would be passed here.
    if (req.method === 'GET') {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`, // Use app's GITHUB_TOKEN for public repo reads
          Accept: 'application/vnd.github.v3+json'
        }
      });
      res.status(200).json(response.data);
    } else if (req.method === 'POST') {
      // For POST requests (creating events), authentication and authorization are required.
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Autenticación requerida: Token Bearer faltante.' });
      }
      const token = authHeader.split(' ')[1];

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
      }

      // Check if the authenticated user is authorized to create events
      if (!AUTHORIZED_EMAILS.includes(decoded.email)) {
        return res.status(403).json({ message: `Acceso Denegado: Tu correo electrónico (${decoded.email}) no está autorizado para crear eventos.` });
      }

      const { title, body } = req.body;
      const response = await axios.post(apiUrl, {
        title,
        body
      }, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`, // Use app's GITHUB_TOKEN to create issue
          Accept: 'application/vnd.github.v3+json'
        }
      });
      res.status(201).json(response.data);
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(error.response ? error.response.status : 500).json({ message: 'An error occurred' });
  }
};