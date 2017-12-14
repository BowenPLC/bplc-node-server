const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const constants = require('./costants');
const routes = require('./routes');
const fs = require('fs-extra');
const types = require('./types');

class BPLCServer {
    constructor(core, configPath, port) {
        types.verify(core, types.types.CoreV1);

        this.core = core;
        this.configPath = configPath || constants.defaults.configPath;
        this.port = port || constants.defaults.port;

        this.runningProgram = false;
    }

    async init() {
        await this.readConfig();

        this.app = express();
        this.app.use(bodyParser.json({ limit: '100mb', }));
        routes(this);

        this.server = http.createServer(this.app);
        this.server.listen(this.port);
    }

    async readConfig() {
        if (await fs.exists(this.configPath)) {
            const configContent = await fs.readFile(this.configPath);
            this.config = JSON.parse(configContent);
            this.core.setConfig(this.config);
        } else {
            await this.writeConfig({});
        }
    }

    async writeConfig(config) {
        await fs.writeFile(this.configPath, JSON.stringify(config));
        this.config = config;
        this.core.setConfig(config);
    }

    getStatus() {
        return {
            status: {
                core: this.core.getStatus(),
                server: { runningProgram: this.runningProgram, },
            },
        };
    }

    async setIO(mod, index, state) {
        if (this.runningProgram) {
            return {
                status: 412,
                error: { message: 'Cannot set IO while running program.', },
            };
        }

        return await this.core.setIO(mod, index, state);
    }
}

module.exports = BPLCServer;
