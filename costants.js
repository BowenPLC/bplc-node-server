module.exports = {
    defaults: {
        configPath: 'config.json',
        port: 8080,
    },
    version: { apiVersion: 1, },
    io: {
        modules: {
            DigitalOutput: 'DigitalOutput',
            StringOutput: 'StringOutput',
        },
    },
};
