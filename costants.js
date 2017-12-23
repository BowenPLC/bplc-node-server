module.exports = {
    defaults: {
        configPath: 'config.json',
        port: 8080,
        programsFolder: './programs',
    },
    version: { apiVersion: 1, },
    io: {
        modules: {
            DigitalOutput: 'DigitalOutput',
            StringOutput: 'StringOutput',
        },
    },
};
