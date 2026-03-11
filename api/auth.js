const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const AUTHORIZED_EMAILS = [
  'laplazasolanas@gmail.com',
  'adrianohernanvillar@gmail.com'
];

const userAuthorized = (email) => {
  return AUTHORIZED_EMAILS.includes(email);
}

const authorizeApiCall = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Autenticación requerida: Token Bearer faltante.' });
    return false;
  }
  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
    return false;
  }

  if (!userAuthorized(decoded.email)) {
    res.status(403).json({ message: `Acceso Denegado: Tu correo electrónico (${decoded.email}) no está autorizado.` });
    return false;
  }
  return true;
};

const isAuthorized = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return userAuthorized(decoded.email);
  } catch (err) {
    return false;
  }
};

module.exports = {
  authorizeApiCall, isAuthorized, userAuthorized
};