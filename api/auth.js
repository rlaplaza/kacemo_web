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
  if (!isAuthorized(req)) {
    res.status(401).json({ message: 'Autenticación requerida o acceso denegado.' });
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

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return false;
  }

  return userAuthorized(decoded.email);
};

module.exports = {
  authorizeApiCall, isAuthorized, userAuthorized
};