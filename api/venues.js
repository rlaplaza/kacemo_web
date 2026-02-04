const axios = require('axios');
const jwt = require('jsonwebtoken');
const { AUTHORIZED_EMAILS } = require('./auth'); // Corrected import path (auth.js is now directly in api/)

const GITHUB_USERNAME = 'rlaplaza';
const GITHUB_REPONAME = 'kacemo_web';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Application's PAT for GitHub API calls
const JWT_SECRET = process.env.JWT_SECRET;
const VENUES_FILE_PATH = 'frontend/src/data/venues.json';

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(204).end();
    return;
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${VENUES_FILE_PATH}`;

  try {
    if (req.method === 'GET') {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.com.v3.raw' // Request raw content for JSON file
        }
      });
      // GitHub API for contents returns base64 encoded by default unless Accept header specifies raw
      // If we request raw, it will be already decoded.
      // const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      res.status(200).json(response.data); // If raw content is requested, response.data is directly the JSON
    } else if (req.method === 'PUT') {
      // For PUT requests (updating venues), authentication and authorization are required.
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

      // Check if the authenticated user is authorized to create/update venues
      if (!AUTHORIZED_EMAILS.includes(decoded.email)) {
        return res.status(403).json({ message: `Acceso Denegado: Tu correo electrónico (${decoded.email}) no está autorizado para actualizar lugares.` });
      }

      const { name, address } = req.body;

      // 1. Get the current file content and SHA
      const getFileResponse = await axios.get(apiUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json' // Request full metadata including SHA
        }
      });

      const fileSha = getFileResponse.data.sha;
      const currentContentBase64 = getFileResponse.data.content;
      const currentContent = Buffer.from(currentContentBase64, 'base64').toString('utf8');
      const venues = JSON.parse(currentContent);

      // 2. Add the new venue
      venues.push({ name, address });

      // 3. Encode the updated content
      const updatedContent = JSON.stringify(venues, null, 2);
      const updatedContentBase64 = Buffer.from(updatedContent).toString('base64');

      // 4. Update the file on GitHub
      await axios.put(apiUrl, {
        message: `Add new venue: ${name}`,
        content: updatedContentBase64,
        sha: fileSha
      }, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      res.status(200).json({ message: '¡Lugar añadido correctamente!' });

    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(error.response ? error.response.status : 500).json({ message: 'An error occurred' });
  }
};