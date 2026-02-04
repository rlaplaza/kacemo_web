// A single source of truth for authorized Google email addresses.
// For a production application, this list would typically be managed
// in a database or a secure configuration service.
const AUTHORIZED_EMAILS = [
  'laplazasolanas@gmail.com', // <<-- IMPORTANT: Replace with actual authorized Google email addresses
  'adrianohernanvillar@gmail.com'
  // Add more authorized emails here
];

module.exports = {
  AUTHORIZED_EMAILS,
};
