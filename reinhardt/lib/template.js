var _ = require('underscore');

var Parser = require('./parser').Parser;
var Compiler = require('./compiler').Compiler;

exports.filters = {};
exports.tags = {};

exports.compile = function (templateSource) {
	var parser = new Parser;
	var compiler = new Compiler(parser);

	compiler.on('transition', function (c) {
		console.log('state', c);
	})

	if (_(templateSource).isString()) {
		for (var c = 0; c < templateSource.length; c++) {
			parser.input(templateSource[c]);
		}
		parser.end();
		return function (context) {
			var output = "";
			for (var i = 0; i < compiler.data.length; i++) {
				if (_(compiler.data[i]).isFunction()) {
					output += compiler.data[i](context);
				} else {
					output += compiler.data[i];
				}
			}
			return output;
		};
	}/* else if ( templateSource is stream ) {
		
	} else if ( templateSource is buffer ) {
		
	}*/
};