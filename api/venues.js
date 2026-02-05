const { authorizeApiCall } = require('./auth');
const { getJsonStore, setJsonStore } = require('./storage/github-store');
const { handleCorsPreflight } = require('./cors');
const VENUES_FILE_PATH = 'frontend/src/data/venues';

module.exports = async (req, res) => {
  handleCorsPreflight(req, res);

  try {
    if (req.method === 'GET') {
      const venues = await getJsonStore(VENUES_FILE_PATH); 
      res.status(200).json(venues.unpack());
    } else if (req.method === 'PUT') {
      if(!authorizeApiCall(req, res)) { return; }

      const { name, address } = req.body;
      let venues = (await getJsonStore(VENUES_FILE_PATH)).unpack(); 

      venues.push({ name:name, address:address });

      (await setJsonStore(VENUES_FILE_PATH, venues)).unpack();
      res.status(200).json({ message: 'Venue added correctly' });
    } else {
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(error.response ? error.response.status : 500).json({ message: 'An error occurred' });
  }
};