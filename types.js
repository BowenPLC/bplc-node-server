function verify(object, template) {
    for (const key in template) {
        const type = typeof object[ key ];
        const expected = template[ key ];
        if (type !== expected) {
            throw new Error(`Type error: missing or incorrect type ${type} for key ${key}: ${expected}`);
        }
    }
}

module.exports.verify = verify;
module.exports.types = {
    CoreV1: {
        status: 'object',
        setIO: 'function',
        dump: 'function',
    },
};
