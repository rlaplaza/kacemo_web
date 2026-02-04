const axios = require('axios');

const GITHUB_USERNAME = 'rlaplaza';
const GITHUB_REPONAME = 'kacemo_web';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Changed from REACT_APP_GITHUB_TOKEN
const VENUES_FILE_PATH = 'frontend/src/data/venues.json';

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS,POST'); // Added POST for completeness
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(204).end();
    return;
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${VENUES_FILE_PATH}`;

  try {
    if (req.method === 'GET') {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      res.status(200).json(JSON.parse(content));

    } else if (req.method === 'PUT') {
      const { name, address } = req.body;

      // 1. Get the current file content and SHA
      const getFileResponse = await axios.get(apiUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
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

      res.status(200).json({ message: 'Venue added successfully!' });

    } else {
      // res.setHeader('Allow', ['GET', 'PUT']); // Allow header is handled by OPTIONS
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(error.response ? error.response.status : 500).json({ message: 'An error occurred' });
  }
};