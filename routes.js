const constants = require('./costants');

const basePath = `/v${constants.version.apiVersion}`;

function createJsonReponse(res, data, status) {
    data = data || {};
    status = status || 200;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    app.get(`${basePath}/io/complete`, async(req, res) => {
        createJsonReponse(res, await server.core.dump());
    });

    app.post(`${basePath}/io/:module/:index`, async(req, res) => {
        const err = await server.setIO(req.params.module, req.params.index, req.body.state);
        if (err) {
            createJsonReponse(res, err.error, err.status);
        } else {
            createJsonReponse(res);
        }
    });

    // Program Routes
    app.post(`${basePath}/programs/run`, async(req, res) => {
        const err = await server.runProgram(req.params.programName);
        if (err) {
            createJsonReponse(res, err.error, err.status);
        } else {
            createJsonReponse(res);
        }
    });

    app.post(`${basePath}/programs/stop`, async(req, res) => {
        const err = await server.stopProgram();
        if (err) {
            createJsonReponse(res, err.error, err.status);
        } else {
            createJsonReponse(res);
        }
    });

    app.get(`${basePath}/programs`, async(req, res) => {
        return createJsonReponse(res, await server.getPrograms());
    });
};
