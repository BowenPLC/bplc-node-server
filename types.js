function verify(object, template) {
    for (const key in template) {
        const type = typeof object[ key ];
        const expected = template[ key ];
        if (type !== expected) {
            throw new Error(`Type error: missing or incorrect type "${type}" for key "${key}": "${expected}"`);
        }
    }
}

module.exports.verify = verify;
module.exports.types = {
    CoreV1: {
        getStatus: 'function',
        setIO: 'function',
        dump: 'function',
        setConfig: 'function',
    },
    IOModuleV1: {
        name: 'string',
        implType: 'string',
        moduleType: 'string',
        get: 'function',
        set: 'function',
    }
};
