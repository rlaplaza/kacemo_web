const axios = require('axios');

const GITHUB_USERNAME = 'rlaplaza';
const GITHUB_REPONAME = 'kacemo_web';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 

const ok = (data=null) => { return { failed: false, data: data, unpack: () => { return data; } } };
const err = (error=null) => { return { failed: true, error: error, unpack: () => { throw error; } } };

const getObject = async (path) => {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${path}`;
    try {
        const response = await axios.get(apiUrl, {
            headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.object+json'
            }
        });
    
        return ok(response.data);
    } catch (error) {
        return err(error);
    }
};

const storeExists = async (path) => {
    return !getObject(path).failed;
};

const getJsonStore = async (path) => {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${path}.json`;
    try {
        const response = await axios.get(apiUrl, {
            headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.com.v3.raw'
            }
        });
        return ok(response.data);
    } catch (error) {
        return err(error);
    }
    
};

const setJsonStore = async (path, data, sha=-1, message="Update JSON store") =>  {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${path}.json`;
    if (sha < 0) {
        const store = await getObject(`${path}.json`);
        sha = store.failed ? '' : store.unpack().sha;
    }
    
    try {
        await axios.put(apiUrl, {
            message: `${message}: ${path}`,
            content: Buffer.from(JSON.stringify(data,null,2)).toString('base64'),
          ...(sha) && {sha: sha}
          }, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json'
            }
          });
        return ok();
    } catch (error) {
        return err(error);
    }
};

const pushIssue = async (title, body) => {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/issues`;
    try {
        await axios.post(apiUrl, {
            title,
            body
        }, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        return ok();
    } catch (error) {
        return err(error);
    }
};

const getIssues = async () => {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/issues`;
    try {
        const response = await axios.get(apiUrl, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json'
            }
        });
        return ok(response.data);
    } catch(error) {
        return err(error);
    }
}

const setRawStore = async (path, base64, mimetype, sha=-1, message="Set raw store") => {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${path}`;
    if (sha < 0) {
        const store = await getObject(`${path}.json`);
        const sha = store.failed ? 0 : store.unpack().sha;
    }
    
    try {
        await axios.put(apiUrl, {
          message: `${message}: ${path} with type ${mimetype}`,
          content: base64,
          ...(sha) && {sha: sha}
        }, {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            'Content-Type': mimetype, 
            Accept: 'application/vnd.github.v3+json',
          },
        });
        return ok();
    } catch (error) {
        return err(error);
    }
};

const getStorePublicURL = (path) => {
    return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPONAME}/main/${path}`;
};

module.exports = {
    getObject, storeExists, setJsonStore, getJsonStore, pushIssue, getIssues, setRawStore, getStorePublicURL
};
