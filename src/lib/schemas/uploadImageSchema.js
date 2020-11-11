export default {
    properties: {
        body: {
            type: 'object',
            properties: {
                base64: {
                    type: 'string',
                    minLength: 1,
                    pattern: `\=$`,
                },
            },
            required: ['base64'],
        },
    },
    required: ['body'],
};
