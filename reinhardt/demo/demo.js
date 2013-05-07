var _ = require('underscore');
var template = require('reinhardt');

template.filters['caps'] = function () {
	return this.toUpperCase();
};

template.filters['times'] = function (numTimes, extra) {
	var output = "";
	_(numTimes).times(function () {
		output += this;
	}, this);
	if (extra) {
		output += extra;
	}
	return output;
};

template.tags['url'] = {
	compile: function (name) {
		return function () {
			if (name.trim() === 'google') {
				return 'http://www.google.com';
			} else if (name.trim() === 'yahoo') {
				return 'http://www.yahoo.com';
			}
		};
	}
};

var demoTemplate = require('fs').readFileSync('./sample.txt', 'utf8');

var compiled = template.compile(demoTemplate);

console.log(compiled({
	'favorite-color': 'green',
	'times': 3
}));