var _ = require("underscore"),
    events = require("events"),
    testCase = require("nodeunit").testCase,
    rebop = require("rebop");

var resource = rebop.resource;

var topics = exports;

topics['Calling known method without having a identifier defined generates error'] = function (test) {
    test.expect(1);
    var resource = rebop.resource.create();
    test.throws(
        function () {
            resource.processRequest({ method: "GET" });
        }, 
        "The system returned a resource without a identifier."
    );
    test.done();
};

topics['Default Resource'] = testCase({
    setUp: function (callback) {
        this.resource = resource.create("index");
        callback();
    },
    
    'matches expected interface': function (test) {
        test.expect(9);
        test.ok(typeof this.resource.identifier === 'function');
        test.ok(typeof this.resource.identify === 'function');
        test.ok(typeof this.resource.processRequest === 'function');
        test.ok(typeof this.resource.get === 'function');
        test.ok(typeof this.resource.put === 'function');
        test.ok(typeof this.resource.post === 'function');
        test.ok(typeof this.resource.delete === 'function');
        test.ok(typeof this.resource.knownMethods === 'function');
        test.ok(typeof this.resource.allowedMethods === 'function');
        test.done();
    },
    'knows basic methods': function (test) {
        test.expect(4);
        test.ok(_(this.resource.knownMethods()).include('get'));
        test.ok(_(this.resource.knownMethods()).include('post'));
        test.ok(_(this.resource.knownMethods()).include('put'));
        test.ok(_(this.resource.knownMethods()).include('delete'));
        test.done();
    },
    'knows its identifier': function (test) {
        test.expect(1);
        test.equal(this.resource.identifier(), "index");
        test.done();
    },
    'knows allowed methods': function (test){
        test.expect(3);
        test.ok(this.resource.allowedMethods().length == 0);
        this.resource.get(function () {});
        test.ok(this.resource.allowedMethods().length == 1);
        test.ok(_(this.resource.allowedMethods()).include('get'));
        test.done();
    },
    'can assign and call identify': function (test) {
        test.expect(1);
        this.resource.identify(function () {
            test.ok(true);
        });
        this.resource.identify();
        test.done();
    },
    'can change its identifier': function (test) {
        test.expect(2);
        test.equal(this.resource.identifier(), "index");
        this.resource.identifier("default");
        test.equal(this.resource.identifier(), "default");
        test.done();
    },
    'can change pattern': function (test) {
        test.expect(2);
        test.equal(this.resource.pattern(), "string");
        this.resource.pattern("date");
        test.equal(this.resource.pattern(), "date");
        test.done();
    },
    'can convert to string': function (test) {
        test.expect(1);
        test.equal(this.resource.toString(), "index");
        test.done();
    },
    'Nonsense HTTP method generates 501 error': function (test) {
        test.expect(1);
        var res = this.resource;
        try {
            res.processRequest({ method: 'DANCE' });
        } catch (e) {
            test.ok(e.code === 501);
        }
        test.done();
    },
    'Known, but unbound HTTP method generates 405 error': function (test) {
        test.expect(1);
        var res = this.resource;
        try {
            res.processRequest({ method: 'GET' });
        } catch (e) {
            test.ok(e.code === 405);
        }
        test.done();
    },
    'Generated 405 error properly lists allowed methods': function (test) {
        test.expect(1);
        this.resource.get(function () {});
        this.resource.post(function () {});
        try {
            this.resource.processRequest({ method: 'DELETE' });
        } catch (err) {
            test.ok( 
                _(err.allows).all(function (i) {
                    return i == 'get' || i == 'post';
                })
            );
            test.done();
        }
    },
    'Binding handler for known HTTP method succeeds': function (test) {
        test.expect(1);
        var hasRun = false;
        this.resource.get(function (request) {
            if (request.method === 'GET') {
                hasRun = true;
            }
        });
        this.resource.processRequest({ method: 'GET' });
        test.equal(hasRun, true);
        test.done();
    },
    'Should throw error on event emit when no identifier is defined': function (test) {
        test.expect(1);
        var res = resource.create();
        test.throws(
            function () {
                res.get(function (request) {});
                res.get({});
            },
            "The system returned a resource without a identifier.");
        test.done();
    }
});

topics["Default Collection"] = testCase({
    setUp: function (callback) {
        this.collection = resource.collection.create("things");
        callback();
    },
    'Matches expected interface': function (test) {
        test.expect(4);
        test.ok(typeof this.collection.addChild === 'function');
        test.ok(typeof this.collection.removeChild === 'function');
        test.ok(typeof this.collection.getChild === 'function');
        test.ok(typeof this.collection.children === 'function');
        test.done();
    },
    'Collection#addChild does not produce exception': function (test) {
        test.expect(1);
        var collection = this.collection;
        test.doesNotThrow(function () {
            var child = resource.create("child");
            collection.addChild(child);
        });
        test.done();
    }
});

topics["Collection with child"] = testCase({
    setUp: function (callback) {
        var child = resource.create("child");
        this.collection = resource.collection.create("parent");
        this.collection.addChild(child);
        callback();
    },
    'Child is retrievable via getChild': function (test) {
        test.expect(1);
        var child = this.collection.getChild("child");
        test.equal(child.identifier(), "child");
        test.done();
    },
    'Child is accessible via Collection#children': function (test) {
        test.expect(1);
        test.ok(
            _(this.collection.children()).detect(function (child) {
                return child.identifier() === "child";
            })
        );
        test.done();
    },
    'Child is removable': function (test) {
        test.expect(2);
        var startLength = this.collection.children().length;
        test.ok(this.collection.getChild("child").identifier() === "child");
        this.collection.removeChild("child");
        test.ok(this.collection.children().length === startLength - 1);
        test.done();
    },
    'Collection#children is writable': function (test) {
        test.expect(1);
        this.collection.children([]);
        test.ok(this.collection.getChild("child") === undefined);
        test.done();
    }
});

topics["Collection with two children"] = testCase({
    setUp: function (callback) {
        this.collection = resource.collection.create("root");
        this.child1 = resource.create("child-1");
        this.child2 = resource.create("child-2");
        this.collection
            .addChild(this.child1)
            .addChild(this.child2);
        callback();
    },
    'child1 is retrievable via getChild': function (test) {
        test.expect(1);
        var child = this.collection.getChild("child-1");
        test.ok(child == this.child1);
        test.done();
    },
    'child2 is retrievable via getChild': function (test) {
        test.expect(1);
        var child = this.collection.getChild("child-2");
        test.ok(child == this.child2);
        test.done();
    }
});

topics["Collection with collection as child"] = testCase({
    setUp: function (callback) {
        this.root = resource.collection.create("root");
        this.branch1 = resource.collection.create("branch1");
        this.root.addChild(this.branch1);
        callback();
    },
    'branch1 is retrievable via getChild': function (test) {
        test.expect(1);
        var child = this.root.getChild("branch1");
        test.ok(child === this.branch1);
        test.done();
    }
});

topics["Collection with resource and collection as child"] = testCase({
    setUp: function (callback) {
        this.root = resource.collection.create("root");
        this.leaf1 = resource.create("leaf1");
        this.branch1 = resource.collection.create("branch1");
        this.root.addChild(this.leaf1).addChild(this.branch1);
        callback();
    },
    'leaf1 is retrievable via getChild': function (test) {
        test.expect(1);
        var child = this.root.getChild("leaf1");
        test.ok(child === this.leaf1);
        test.done();
    },
    'branch1 is retrievable via getChild': function (test) {
        test.expect(1);
        var child = this.root.getChild("branch1");
        test.ok(child === this.branch1);
        test.done();
    }
});

topics["Collection with collection containing resource"] = testCase({
    setUp: function (callback) {
        this.root = resource.collection.create("root");
        this.branch1 = resource.collection.create("branch1");
        this.leaf1 = resource.create("leaf1");
        this.branch1.addChild(this.leaf1);
        this.root.addChild(this.branch1);
        callback();
    },
    'branch1 is retrievable from root': function (test) {
        test.expect(1);
        var res = this.root.getChild("branch1");
        test.strictEqual(res, this.branch1);
        test.done();
    },
    'leaf1 is retrievable from branch1': function (test) {
        test.expect(1);
        var res = this.branch1.getChild("leaf1");
        test.strictEqual(res, this.leaf1);
        test.done();
    },
    'leaf1 is not retrievable from root': function (test) {
        test.expect(1);
        var res = this.root.getChild("leaf1");
        test.equal(res, undefined);
        test.done();
    }
});

topics["Collection containing pattern resource"] = testCase({
    setUp: function (callback) {
        this.root = resource.collection.create("root");
        this.branch1 = resource.create(/\d{4}-\d{2}-\d{2}/, 'regex');
        this.root.addChild(this.branch1);
        callback();
    },
    'matching pattern retrieves branch1': function (test) {
        test.expect(1);
        var res = this.root.getChild("2001-02-02");
        test.equal(res, this.branch1);
        test.done();
    },
    'non-matching pattern retrieves unknown': function (test) {
        test.expect(1);
        var res = this.root.getChild("hurrdurrdurr");
        test.ok(typeof res === 'undefined');
        test.done();
    }
});