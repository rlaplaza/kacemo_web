const axios = require('axios');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // For handling multipart/form-data
const { promisify } = require('util');
const { AUTHORIZED_EMAILS } = require('./auth/auth'); // Corrected import path (now in api/auth/auth.js) (now in api/auth/auth.js)

// Environment Variables
const GITHUB_USERNAME = 'rlaplaza';
const GITHUB_REPONAME = 'kacemo_web';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // App's PAT
const JWT_SECRET = process.env.JWT_SECRET;
const IMAGE_UPLOAD_PATH = 'public/event-posters'; // Folder in GitHub repo to store images

// Configure Multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Convert Multer middleware to a promise-based function
// Need to handle this as a middleware in Vercel's serverless function
const uploadMiddleware = upload.single('image'); // 'image' is the field name from the frontend

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
    res.status(204).end();
    return;
  }

  // Only allow POST requests for actual upload
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Wrap multer in a promise to use with async/await
  const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
      fn(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  };

  try {
    // 1. Authenticate and Authorize User
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

    if (!AUTHORIZED_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ message: `Acceso Denegado: Tu correo electrónico (${decoded.email}) no está autorizado para subir imágenes.` });
    }

    // 2. Process Image Upload with Multer
    await runMiddleware(req, res, uploadMiddleware);

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo o el tipo de archivo no está permitido.' });
    }

    const fileBuffer = req.file.buffer;
    const originalname = req.file.originalname;
    const mimetype = req.file.mimetype;
    const fileExtension = originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const filePathInRepo = `${IMAGE_UPLOAD_PATH}/${fileName}`;

    // 3. Upload to GitHub Contents API
    const githubUploadUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${filePathInRepo}`;
    const base64Content = fileBuffer.toString('base64');

    await axios.put(githubUploadUrl, {
      message: `feat: upload event poster ${fileName}`,
      content: base64Content,
      branch: 'main', // Assuming main branch
    }, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': mimetype, // Specify content type
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // 4. Return the public URL
    // GitHub raw content URL format: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
    const imageUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPONAME}/main/${filePathInRepo}`;

    res.status(200).json({ url: imageUrl, message: 'Imagen subida correctamente.' });

  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: `Error de Multer: ${error.message}` });
    }
    console.error('Error durante la subida de imagen:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error al subir la imagen.' });
  }
};