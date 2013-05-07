var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var template = require('./template');

var Compiler = exports.Compiler = function Compiler(parser) {
	EventEmitter.call(this);
	this.currentState = 'text';
	this.data = [];

	var compiler = this;

	this.tokenHandler = function (tokenType, token) {
		//console.log('state: ', this.currentState, ' tokenType: ', tokenType, ' token: ', token);
		var stateHandler = Compiler.stateActions[this.currentState];
		var actionHandler = stateHandler[tokenType];
		this.currentState = actionHandler.call(this, token);
	};

	if (parser) {
		this.connectParser(parser);
	}
};

Compiler.stateActions = {
	'text': {
		'text': function (text) {
			this.pushText(text);
			return 'text';
		},
		'tag-name': function (tagName) {
			this.addTag(tagName);
			return 'tag-name';
		},
		'variable': function (variableName) {
			this.addVariable(variableName);
			return 'variable';
		}
	},

	'tag-name': {
		'tag-body': function (tagBody) {
			this.addTagBody(tagBody);
			return 'tag-body';
		},
		'text': function (text) {
			this.pushTag();
			this.pushText(text);
			return 'text';
		},
		'variable': function (variableName) {
			this.pushTag();
			this.addVariable(variableName);
			return 'variable';
		},
		'tag-name': function (tagName) {
			this.pushTag();
			this.addTag(tagName);
			return 'tag-name';
		}
	},

	'tag-body': {
		'text': function (text) {
			this.pushTag();
			this.pushText(text);
			return 'text';
		},
		'variable': function (variableName) {
			this.pushTag();
			this.addVariable(variableName);
			return 'variable';
		},
		'tag-name': function (tagName) {
			this.pushTag();
			this.addTag(tagName);
			return 'tag-name';
		}
	},

	'variable': {
		'text': function (text) {
			this.pushVariable();
			this.pushText(text);
			return 'text';
		},
		'tag-name': function (tagName) {
			this.pushVariable();
			this.addTag(tagName);
			return 'tag-name';
		},
		'filter': function (filterName) {
			this.addFilter(filterName);
			return 'filter';
		}
	},

	'filter': {
		'parameter': function (parameter) {
			this.addParameter(parameter);
			return 'parameter';
		},
		'filter': function (filterName) {
			this.pushFilter();
			this.addFilter(filterName);
			return 'filter';
		},
		'text': function (text) {
			this.pushFilter();
			this.pushVariable();
			this.pushText(text);
			return 'text';
		},
		'tag-name': function (tagName) {
			this.pushFilter();
			this.pushVariable();
			this.addTag(tagName);
			return 'tag-name';
		},
		'variable': function (variableName) {
			this.pushFilter();
			this.pushVariable();
			this.addVariable(variableName);
			return 'variable';
		}
	},

	'parameter': {
		'parameter': function (parameter) {
			this.addParameter(parameter);
			return 'parameter';
		},
		'filter': function (filter) {
			this.pushFilter();
			this.addFilter();
			return 'filter';
		},
		'text': function (text) {
			this.pushFilter();
			this.pushVariable();
			this.pushText(text);
			return 'text';
		},
		'tag-name': function (tagName) {
			this.pushFilter();
			this.pushVariable();
			this.addTag(tagName);
			return 'tag-name';
		},
		'variable': function (variableName) {
			this.pushFilter();
			this.pushVariable();
			this.addVariable(variableName);
			return 'variable';
		}
	}
};

Compiler.prototype = _(new EventEmitter).extend({
	connectParser: function (parser) {
		var compiler = this;
		this.parser = parser;
		this.parser.on('token', function () {
			compiler.tokenHandler.apply(compiler, arguments);
		});
		this.parser.on('end', function () {
			compiler.emit('end');
		});
	},
	pushText: function (text) {
		this.data.push(text);
	},
	addVariable: function (variableName) {
		this.variable = { name: variableName };
	},
	addFilter: function (filterName) {
		if (!filterName in template.filters) {
			throw new Error('No filter named, "' + filterName + '", in registry.');
		}
		if (typeof this.variable.filters === 'undefined') {
			this.variable.filters = [];
		}
		this.filter = [filterName];
	},
	addParameter: function (parameter) {
		this.filter.push(parameter);
	},
	pushFilter: function () {
		this.variable.filters.push(this.filter);
	},
	pushVariable: function () {
		var variable = this.variable;
		this.data.push(function (context) {
			var ctxVar;
			if (variable.name in context) {
				ctxVar = context[variable.name];
			}

			if (_(ctxVar).isFunction()) {
				ctxVar = ctxVar(context);
			}

			if ('filters' in variable) {
				ctxVar = _(variable.filters).reduce(function (value, filter) {
					var filterName = filter.shift();
					filter = _(filter).map(function (val) {
						if (val[0] === '"' || val[0] === "'") {
							var unquoted = val.substr(1, val.length - 2);
							return unquoted;
						} else if (/^[A-Z][A-Z0-9-_]*$/i.test(val)) {
							return context[val];
						} else {
							return val;
						}
					});
					if (filterName in template.filters) {
						return template.filters[filterName].apply(value, filter);
					} else {
						throw new Error('No filter named ' + filterName);
					}
				}, ctxVar);
			}

			return ctxVar;
		});
	},
	addTag: function (tagName) {
		if (tagName in template.tags) {
			this.tag = { name: tagName };
		} else {
			throw new Error('No tag named, "' + this.tag.name + '", in registry.');
		}
	},
	addTagBody: function (tagBody) {
		this.tag.body = tagBody;
	},
	pushTag: function () {
		var tagFn = template.tags[this.tag.name].compile(this.tag.body);
		this.data.push(function (context) {
			return tagFn(context);
		});
	},
	end: function () {
		this.parser.end();
	}
});

Compiler.prototype.constructor = Compiler;