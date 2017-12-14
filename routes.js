const constants = require('./costants');

const basePath = `/v${constants.version.apiVersion}`;

function createJsonReponse(res, data, status) {
    data = data || {};
    status = status || 200;

    res.setHeader('Content-Type', 'application/json');
    res.status(status);
    res.send(`${JSON.stringify(data)}\n`);
}

module.exports = function(server) {
    const app = server.app;

    // Configuration routes
    app.get(`${basePath}/config`, (req, res) => {
        createJsonReponse(res, server.config);
    });

    app.post(`${basePath}/config`, async(req, res) => {
        await server.writeConfig(req.body.config);
        createJsonReponse(res);
    });

    // Status routes
    app.get(`${basePath}/status`, (req, res) => {
        createJsonReponse(res, server.getStatus());
    });

    // IO routes
    // IMPROVE: This is temporary. Need a way to get IO without
    //          interrupting critical timing.
    app.get(`${basePath}/io/complete`, (req, res) => {
        createJsonReponse(res, server.core.dump());
    });

    app.post(`${basePath}/io/:module/:index`, async(req, res) => {
        const err = await server.setIO(req.params.module, req.params.index, req.body.state);
        if (err) {
            createJsonReponse(res, err.error, err.status);
        } else {
            createJsonReponse(res);
        }
    });
};
