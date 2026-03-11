const { authorizeApiCall, isAuthorized } = require('./auth');
const { pushIssue, getIssues } = require('./storage/github-store');
const { handleCorsPreflight } = require('./cors');

module.exports = async (req, res) => {
  handleCorsPreflight(req, res);
  
  try {
    if (req.method === 'GET') {
      let issues = await getIssues();
      let unpackedIssues = issues.unpack();

      if (!isAuthorized(req)) {
        // Filter events that are marked as invisible.
        // For backward compatibility, assume visible if not specified.
        unpackedIssues = unpackedIssues.filter(issue => {
          if (!issue.body) return true;
          const visibleMatch = issue.body.match(/\*\*Visible:\*\* (.*)/);
          if (visibleMatch) {
            return visibleMatch[1].trim().toLowerCase() === 'true';
          }
          return true; // Default to true if not specified
        });
      }

      res.status(200).json(unpackedIssues);
    } else if (req.method === 'POST') {
      if(!authorizeApiCall(req, res)) { return; }
      
      const { title, body } = req.body;
      let response = await pushIssue(title, body);
      res.status(201).json(response.unpack());
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(error.response ? error.response.status : 500).json({ message: 'An error occurred' });
  }
};