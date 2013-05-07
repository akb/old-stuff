var rebop = require("rebop"),
	testCase = require("nodeunit").testCase;

var topics = exports;

topics["String identifier"] = testCase({
	setUp: function (callback) {
		this.identifier = "foobar";
		this.pattern = rebop.pattern('string');
		callback();
	},
	'"foobar" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("foobar", this.identifier));
		test.done();
	},
	'"fubar" does not match identifier': function (test) {
		test.expect(1);
		test.ok(!this.pattern.compare("fubar", this.identifier));
		test.done();
	}
});

topics["Regex identifier"] = testCase({
	setUp: function (callback) {
		this.identifier = /^[A-Z]+$/i;
		this.pattern = rebop.pattern('regex');
		callback();
	},
	'"foobar" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("foobar", this.identifier));
		test.done();
	},
	'"foo2bar" does not match identifier': function (test) {
		test.expect(1);
		test.ok(!this.pattern.compare("foo2bar", this.identifier));
		test.done();
	}
});

topics["'alpha' identifier"] = testCase({
	setUp: function (callback) {
		this.pattern = rebop.pattern('alpha');
		callback();
	},
	'"foobar" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("foobar"));
		test.done();
	},
	'"foo2bar" does not match identifier': function (test) {
		test.expect(1);
		test.ok(!this.pattern.compare("foo2bar"));
		test.done();
	}
});

topics["'integer' identifier"] = testCase({
	setUp: function (callback) {
		this.pattern = rebop.pattern('integer');
		callback();
	},
	'"1234" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("1234"));
		test.done();
	},
	'"ABCD" does not match identifier': function (test) {
		test.expect(1);
		test.ok(!this.pattern.compare("ABCD"));
		test.done();
	}
});

topics["'year' identifier"] = testCase({
	setUp: function (callback) {
		this.pattern = rebop.pattern('year');
		callback();
	},
	'"2004" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("2004"));
		test.done();
	},
	'"12345" does not match identifier': function (test) {
		test.expect(1);
		test.ok(!this.pattern.compare("12345"));
		test.done();
	}
});

topics["'month' identifier"] = testCase({
	setUp: function (callback) {
		this.pattern = rebop.pattern('month');
		callback();
	},
	'"8" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("8"));
		test.done();
	},
	'"12" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("12"));
		test.done();
	},
	'"Jan" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("Jan"));
		test.done();
	},
	'"september" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("september"));
		test.done();
	},
	'"novembeard" does not match identifier': function (test) {
		test.expect(1);
		test.ok(!this.pattern.compare("novembeard"));
		test.done();
	}
});

topics["'day' identifier"] = testCase({
	setUp: function (callback) {
		this.pattern = rebop.pattern('day');
		callback();
	},
	'"01" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("01"));
		test.done();
	},
	'"4" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("1"));
		test.done();
	},
	'"24" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("24"));
		test.done();
	},
	'"31" matches identifier': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare("31"));
		test.done();
	},
	'"32" does not match identifier': function (test) {
		test.expect(1);
		test.ok(!this.pattern.compare("32"));
		test.done();
	}
});

topics["custom pattern"] = testCase({
	setUp: function (callback) {
		rebop.pattern.patterns['foobar'] = /^(?:foo)(?:bar)?$/;
		this.pattern = rebop.pattern('foobar');
		callback();
	},
	'pattern is retrievable after registration': function (test) {
		test.expect(1);
		test.ok(this.pattern.compare('foo'));
		test.done();
	}
});
