var events = require("events"),
    _ = require("underscore"),
    errors = require("./errors"),
    patternLib = require("./pattern"),
    resource, collection;

module.exports.create = function () {
    return resource.create.apply(null, arguments);
};

module.exports.resource = resource = {
    create: function (identifier, pattern) {
        var self = new events.EventEmitter(), 
            knownMethods = ['get', 'post', 'put', 'delete'],
            allowedMethods = [],
            pattern = pattern || 'string';
        
        self.knownMethods = function () {
            return knownMethods;
        };
        
        self.allowedMethods = function () {
            return allowedMethods;
        };
        
        var identifyHandler = function () {};
        self.identify = function (opt) {
            if (typeof opt === 'function') {
                identifyHandler = opt;
                return self;
            } else {
                return identifyHandler(opt);
            }
        };
        
        self.identifier = function (newIdentifier) {
            if (newIdentifier) {
                identifier = newIdentifier;
                return self;
            } else {
                return identifier;
            }
        };
        
        self.pattern = function (newPattern) {
            if (newPattern) {
                pattern = newPattern;
                return self;
            } else {
                return pattern;
            }
        };
        
        self.identifierMatches = function (match) {
            return patternLib(pattern).compare(match, identifier);
        };
        
        self.processRequest = function (request, response, complete) {
            if (_(knownMethods).include(request.method.toLowerCase())) {
                self.emit(request.method.toLowerCase(), request, response, complete);
            } else {
                throw errors.NotImplemented(request.method);
            }
        };
        
        self.toString = function () {
            return self.identifier().toString();
        };
        
        for (var i in knownMethods) {
            self[knownMethods[i]] = (function (method) {
                return function (opt) {
                    if (typeof opt == 'function') {
                        self.on(method, opt);
                    } else {
                        var args = Array.prototype.slice.call(args);
                        args.unshift(method);
                        self.emit.apply(self, args);
                    }
                };
            })(knownMethods[i]);
        }
        
        self.on('newListener', function (event, listener) {
            if ( _(knownMethods).include(event) && !_(allowedMethods).include(event) ) {
                allowedMethods.push(event);
            }
        });
        
        self.emit = _(self.emit).wrap(function (fn) {
            if ( !identifier && _(knownMethods).include(arguments[1]) ) {
                throw new Error("The system returned a resource without a identifier.");
            }
            
            if ( _(knownMethods).include(arguments[1]) && !_(allowedMethods).include(arguments[1]) ) {
                throw errors.MethodNotAllowed(arguments[1], allowedMethods);
            } else {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                fn.apply(self, args);
            }
        });
        
        return self;
    }
};

module.exports.collection = collection = {
    create: function (identifier) {
        var self, children = [];
        
        self = resource.create(identifier);
        
        self.addChild = function (newChild) {
            if (newChild) {
                self.removeChild(newChild.identifier);
                children.push(newChild);
            }
            self.emit('child added', newChild);
            return self;
        };
        
        self.getChild = function (identifier) {
            return _(children).detect(function (child) {
                return child.identifierMatches(identifier);
            });
        };

        self.removeChild = function (identifier) {
            var updatedChildren = _(children).reject(function (child) { 
                return child.identifier() == identifier;
            });
            if (updatedChildren.length != children.length) {
                children = updatedChildren;
                self.emit('child removed', identifier);
                return true;
            } else {
                return false;
            }
        };
        
        self.children = function (newChildren) {
            if (newChildren) {
                children = newChildren;
                return self;
            } else {
                return children;
            }
        };
        
        return self;
    }
};
