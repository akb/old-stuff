var _ = require("underscore")
    events = require("events"),
    testCase = require("nodeunit").testCase,
    rebop = require("rebop");

var resource = rebop.resource,
    router = rebop.router;

var topics = exports;

topics["Invalid input to constructor throws error"] = function (test) {
    test.expect(1);
    test.throws(function () {
        var route = router.create();
    });
    test.done();
};

topics["Three level resource tree"] = testCase({
    /*
        /
        /leaf-1
        /branch-1
        /branch-1/leaf-2
        /branch-1/branch-2
        /branch-1/branch-2/leaf-3
    */
    setUp: function (callback) {
        this.root = resource.collection.create('root');
        this.leaf1 = resource.create('leaf-1');
        this.leaf2 = resource.create('leaf-2');
        this.leaf3 = resource.create('leaf-3');
        this.branch1 = resource.collection.create('branch-1');
        this.branch2 = resource.collection.create('branch-2');
        
        this.root
            .addChild(this.leaf1)
            .addChild(this.branch1);
        
        this.branch1
            .addChild(this.leaf2)
            .addChild(this.branch2);
        
        this.branch2
            .addChild(this.leaf3);
        
        this.router = router.create(this.root);
        callback();
    },
    
    '"/" retrieves root': function (test) {
        test.expect(1);
        test.ok( this.router("/") == this.root );
        test.done();
    },
    '"/leaf-1" retrieves leaf1': function (test) {
        test.expect(1);
        test.ok( this.router("/leaf-1") == this.leaf1 );
        test.done();
    },
    '"/branch-1" retrieves branch1': function (test) {
        test.expect(1);
        test.ok( this.router("/branch-1") == this.branch1 );
        test.done();
    },
    '"/branch-1/leaf-2" retrieves leaf2': function (test) {
        test.expect(1);
        test.ok( this.router("/branch-1/leaf-2") == this.leaf2 );
        test.done();
    },
    '"/branch-1/branch-2" retrieves branch2': function (test) {
        test.expect(1);
        test.ok( this.router("/branch-1/branch-2") == this.branch2 );
        test.done();
    },
    '"/branch-1/branch-2/leaf-3" retrieves leaf3': function (test) {
        test.expect(1);
        test.ok( this.router("/branch-1/branch-2/leaf-3") == this.leaf3 );
        test.done();
    },
    '"/leaf-1/foo" retrieves undefined': function (test) {
        test.expect(1);
        test.ok( this.router("/leaf-1/foo") == undefined);
        test.done();
    }
});