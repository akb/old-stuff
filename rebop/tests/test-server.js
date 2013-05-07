var _ = require("underscore")
    events = require("events"),
    http = require("http"),
    testCase = require("nodeunit").testCase;

var server = require("../rebop/server"),
    resource = require("../rebop/resource"),
    router = require("../rebop/router");

var topics = exports;

topics["Three-level resource tree"] = testCase({
    setUp: function (callback) {
        this.root = resource.collection.create('root');
        this.branch1 = resource.collection.create('branch1');
        this.branch2 = resource.collection.create('branch2');
        this.leaf1 = resource.create('leaf1');
        this.leaf2 = resource.create('leaf2');
        this.leaf3 = resource.create('leaf3');
        
        this.root
            .addChild(this.branch1)
            .addChild(this.leaf1);
        
        this.branch1
            .addChild(this.branch2)
            .addChild(this.leaf2);
        
        this.branch2
            .addChild(this.leaf3);
        
        this.server = server({
            root: this.root
        });
        
        this.server.listen(3000);
        
        callback();
    },
    tearDown: function (callback) {
        this.server.close();
        callback();
    },
    
    'Unknown URL responds with 404': function (test) {
        test.expect(1);
        http.get({
            host: "127.0.0.1",
            port: 3000,
            path: "/foo"
        }, function (response) {
            test.equal(response.statusCode, 404);
            test.done();
        });
    },
    'Unknown method responds with 501': function (test) {
        test.expect(1);
        http.request({
            host: "127.0.0.1",
            port: 3000,
            path: "/",
            method: "MOVE"              // Note: using a method not defined by HTTP 1.1 or WebDAV results in a closed connection
        }, function (response) {        // TODO: Figure out if the connection is closed by the client or the server
            test.equal(response.statusCode, 501);
            test.done();
        }).end();
    },
    'GET / emits "get" event on root': function (test) {
        test.expect(1);
        this.root.get(function (request, response, complete) {
            test.ok(true);
            complete();
        });
        
        http.get({
            host: "127.0.0.1",
            port: 3000,
            path: "/"
        }, function (response) {
            test.done();
        });
    },
    'All resources will emit get event': function (test) {
        var paths = [
            '/', '/leaf1', 
            '/branch1', '/branch1/leaf2', 
            '/branch1/branch2', '/branch1/branch2/leaf3'
        ];
        test.expect(paths.length * 2);
        var route = router.create(this.root);
        for (var i in paths) {
            route(paths[i]).get(function (request, response, complete) {
                test.ok(true);
                response.writeHead(200);
                complete();
            });
        }
        
        var counter = 0;
        function responded() { if (++counter == paths.length) test.done(); }
        
        for (var i in paths) {
            http.get({
                host: "127.0.0.1",
                port: 3000,
                path: paths[i]
            }, function (response) {
                test.ok(true);
                responded();
            });
        }
    }
});