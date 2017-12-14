const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const constants = require('./costants');
const routes = require('./routes');
const fs = require('fs-extra');
const types = require('./types');

class BPLCServer {
    constructor(coreGenerator, configPath, port) {
        this.coreGenerator = coreGenerator;
        this.configPath = configPath || constants.defaults.configPath;
        this.port = port || constants.defaults.port;

        this.runningProgram = false;
    }

    async init() {
        await this.readConfig();
        this.core = this.coreGenerator(this.config);
        types.verify(this.core, types.types.CoreV1);

        this.app = express();
        this.app.use(bodyParser.json({ limit: '100mb', }));
        routes(this.app);

        this.server = http.createServer(this);
        this.server.listen(this.port);
    }

    async readConfig() {
        if (await fs.exists(this.configPath)) {
            const configContent = await fs.readFile(this.configPath);
            this.config = JSON.parse(configContent);
        } else {
            await this.writeConfig({});
        }
    }

    async writeConfig(config) {
        await fs.writeFile(this.configPath, JSON.stringify(config));
    }

    getStatus() {
        return {
            status: {
                core: this.core.status,
                server: { runningProgram: this.runningProgram, },
            },
        };
    }

    async setIO(mod, type, index, state) {
        if (this.runningProgram) {
            return {
                status: 412,
                error: { message: 'Cannot set IO while running program.', },
            };
        }

        return this.core.setIO(mod, type, index, state);
    }
}

module.exports = BPLCServer;
