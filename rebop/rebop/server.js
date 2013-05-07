var _ = require("underscore"),
	http = require("http"),
    url = require("url");

var errors = require("./errors"),
    router = require("./router"),
	resource = require("./resource"),
	create;

module.exports = function () {
	return create.apply(module.exports, arguments);
};

module.exports.create = create = function (opts) {
	var options = _.extend({
		root: resource.collection.create("root"),
		requestFilters: [],
		responseFilters: []
	}, opts);

    var route = router.create(options.root);

    return http.createServer(function (request, response) {
        console.log(request.method + ' ' + request.url);
        try {
            var resource = route(url.parse(request.url).pathname);
            if (resource === undefined) {
                throw errors.NotFound();
            }
            
            resource.processRequest(request, response, function () { 
                response.end();
            });
        } catch (e) {
            if (e.type === "HTTP Error") {
                response.writeHead(e.code, {
                    'Content-Length': 0,
                    'Content-Type': 'text/plain'
                });
            } else {
                response.writeHead(500, {
                    'Content-Length': 0,
                    'Content-Type': 'text/plain'
                });
            }
            response.end();
        }
	});
};