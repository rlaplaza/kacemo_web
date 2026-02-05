const multer = require('multer'); // For handling multipart/form-data
const { authorizeApiCall } = require('./auth');
const { setRawStore, getStorePublicURL } = require('./storage/github-store');
const { handleCorsPreflight } = require('./cors');

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
  handleCorsPreflight(req, res);

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
    if(!authorizeApiCall(req, res)) { return; }

    await runMiddleware(req, res, uploadMiddleware);

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo o el tipo de archivo no está permitido.' });
    }

    const fileBuffer = req.file.buffer;
    const originalname = req.file.originalname;
    const mimetype = req.file.mimetype;
    const extension = originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
    const path = `${IMAGE_UPLOAD_PATH}/${filename}`;
    const base64Content = fileBuffer.toString('base64');

    (await setRawStore(path, base64Content, mimetype, 0, 'Imagen de evento subido correctamente')).unpack();

    res.status(200).json({ url: getStorePublicURL(path), message: 'Imagen subida correctamente.' });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: `Error de Multer: ${error.message}` });
    }
    console.error('Error durante la subida de imagen:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error al subir la imagen.' });
  }
};