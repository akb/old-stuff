var errors = exports;

var HTTPError = function (options) {
    var descriptor = {
        type: { value: 'HTTP Error' },
        code: { value: options.code, enumerable: true },
        name: { value: options.name, enumerable: true },
        description: { value: options.description, enumerable: true },
        message: { value: options.message || '', enumerable: true },
    };
    if (options.allows) {
        descriptor.allows = { value: options.allows, enumerable: true };
    }
    return Object.create(Error, descriptor);
}

errors.NotFound = function (message) {
    return HTTPError({
        code: 404,
        name: 'Not Found',
        description: "The server didn't find anything at the requested URI.",
        message: message || ""
    });
};

errors.InternalServerError = function (message) {
    return HTTPError({
        type: 'HTTP Error',
        code: 500,
        name: 'Internal Server Error',
        description: 'The server encountered an unexpected condition which prevented it from fulfilling the request.',
        message: message
    });
};

errors.NotImplemented = function (method) {
    return HTTPError({
        message: 'The requested resource does not understand the HTTP method, "' + method + '"',
        type: 'HTTP Error',
        code: 501,
        name: 'Not Implemented',
        description: 'The server does not support the functionality required to fulfill the request.'
    });
};

errors.MethodNotAllowed = function (method, allowedMethods) {
    return HTTPError({
        message: 'The requested resource does not allow the use of the HTTP method, "' + method + '"',
        type: 'HTTP Error',
        code: 405,
        name: 'Method Not Allowed',
        description: 'The method specified in the Request-Line is not allowed for the resource identified by the Request-URI.',
        allows: allowedMethods || []
    });
};