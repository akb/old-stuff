var _ = require("underscore"),
    errors = require("./errors");

var create;

module.exports.create = create = function (root) {
    if (root == undefined || typeof root.getChild != 'function') {
        throw new Error("Attempted to instantiate Router with a non-Collection");
    }
    
    return function (path) {
        var segments = path.split("/");
        var resource = root, segment = "";

        if (segments[0].length == 0) {
            segments.shift();
        }
        resource = root;

        while (segments.length > 0) {
            segment = segments.shift();

            if (segments.length == 0 && segment.length == 0) {
                break; // path ends in '/' ignore it and return
            }

            if (typeof resource.getChild == 'function') {
                resource = resource.getChild(segment);
            } else {
                return undefined; // resource has no children but url is asking for child of current resource, should return 404
            }

            // not sure if this case is needed
            // if (resource == undefined) {
            //     break; // resource has no child matching segment
            // }
        }

        return resource;
    };
}