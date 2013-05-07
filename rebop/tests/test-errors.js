var _ = require("underscore"),
    testCase = require("nodeunit").testCase,
    rebop = require("rebop");

// these tests are mainly included to provide 100% coverage since 404 and 500 are left up to Connect to return

exports['NotFound'] = testCase({
    'matches expected interface': function (test) {
        test.expect(5);
        var err = rebop.errors.NotFound("test message");
        test.equal(err.message, "test message");
        test.equal(err.type, "HTTP Error");
        test.equal(err.code, 404);
        test.equal(err.name, "Not Found");
        test.equal(err.description, "The server didn't find anything at the requested URI.");
        test.done();
    }
});

exports['InternalServerError'] = testCase({
    'matches expected interface': function (test) {
        test.expect(5);
        var err = rebop.errors.InternalServerError("test message");
        test.equal(err.message, "test message");
        test.equal(err.type, "HTTP Error");
        test.equal(err.code, 500);
        test.equal(err.name, "Internal Server Error");
        test.equal(err.description, "The server encountered an unexpected condition which prevented it from fulfilling the request.");
        test.done();
    }
});