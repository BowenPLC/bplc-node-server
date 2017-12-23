const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const constants = require('./costants');
const routes = require('./routes');
const fs = require('fs-extra');
const types = require('./types');
const cors = require('cors');
const path = require('path');

class BPLCServer {
    constructor(core, port, configPath) {
        types.verify(core, types.types.CoreV1);

        this.core = core;
        this.configPath = configPath || constants.defaults.configPath;
        this.port = port || constants.defaults.port;

        this.runningProgram = false;
        this.programsFolder = constants.defaults.programsFolder;
    }

    async init() {
        await this.readConfig();

        this.app = express();
        this.app.use(bodyParser.json({ limit: '100mb', }));
        this.app.use(cors());
        routes(this);

        this.server = http.createServer(this.app);
        this.server.listen(this.port);

        if (!await fs.exists(this.programsFolder)) {
            await fs.mkdir(this.programsFolder);
        }
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

    async runProgram(programName) {
        try {
            if (this.runningProgram) {
                return {
                    status: 412,
                    error: { message: 'Already running a program.', },
                };
            }

            const fullPath = path.resolve(`${this.programsFolder}/${programName}.js`);
            if (!await fs.exists(fullPath)) {
                return {
                    status: 404,
                    error: { message: `Could not find program ${programName}`, },
                };
            }

            this.currentProgram = require(fullPath);

            await this.currentProgram.init(this);
            this.runningProgram = true;
            this.currentProgram.start();
            return undefined;
        } catch (err) {
            return err;
        }
    }

    async stopProgram() {
        if (!this.runningProgram) {
            return {
                status: 412,
                error: { message: 'No program is running.', },
            };
        }

        await this.currentProgram.stop();
        this.runningProgram = false;
        return undefined;
    }

    async getPrograms() {
        return (await fs.readdir(this.programsFolder)).filter(x => x.endsWith('.js')).map(x => x.replace('.js', ''));
    }
}

module.exports = BPLCServer;
