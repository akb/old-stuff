require("underscore")
    
    (['errors', 'resource', 'router', 'server', 'pattern'])
        
        .each(function (m) {
            exports[m] = require("./" + m)
        })















// a little excessive ...but isn't it pretty?