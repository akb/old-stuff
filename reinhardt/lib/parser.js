var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');

var Parser = exports.Parser = function Parser() {
	EventEmitter.call(this);
	this.state = 'text';
	this.tokenType = 'text';
	this.tokenBuffer = [];
	this.lineNum = 1;
	this.charNum = 1;
	var parser = this;
};

// todo: escape/unescape
// todo: variable '.' operator
// todo: quoted strings in filter params
Parser.stateActions = {
	'text': {
		'{': function (c) {
			this.flush();
			return 'tag-opening';
		},
		any: function (c) {
			this.push(c);
			return 'text';
		}
	},

	'tag-opening': {
		'{': 'expecting-variable',
		'%': 'expecting-tag',
		'#': 'comment',
		any: 'text'
	},

	'expecting-variable': {
		ws: 'expecting-variable',
		alpha: function (c) {
			this.type('variable');
			this.push(c);
			return 'variable';
		},
		any: 'syntax-error'
	},

	'variable': {
		'|': function (c) {
			this.flush();
			return 'expecting-filter';
		},
		'}': function (c) {
			this.flush();
			return 'expecting-tag-end';
		},
		alphaNum: function (c) {
			this.push(c);
			return 'variable';
		},
		ws: function (c) {
			this.flush();
			return 'end-variable';
		},
		any: 'syntax-error'
	},

	'end-variable': {
		'|': 'expecting-filter',
		'}': 'expecting-tag-end',
		any: 'syntax-error'
	},

	'expecting-filter': {
		ws: 'expecting-filter',
		alpha: function (c) {
			this.type('filter');
			this.push(c)
			return 'filter';
		},
		any: 'syntax-error'
	},

	'filter': {
		':': function (c) {
			this.flush();
			this.type('parameter');
			return 'expecting-parameter';
		},
		'|': function (c) {
			this.flush();
			this.type('filter');
			return 'expecting-filter';
		},
		'}': function (c) {
			this.flush();
			return 'expecting-tag-end';
		},
		alphaNum: function (c) {
			this.push(c);
			return 'filter';
		},
		ws: function (c) {
			this.flush();
			return 'expecting-filter-end';
		},
		any: 'syntax-error'
	},

	'expecting-filter-end': {
		':': 'expecting-parameter',
		'|': 'expecting-filter',
		'}': 'expecting-tag-end',
		ws: 'expecting-filter-end',
		any: 'syntax-error'
	},

	'expecting-parameter': {
		ws: 'expecting-parameter',
		':': function (c) { // flush empty param
			this.type('parameter');
			this.flush();
			return 'expecting-parameter';
		},
		'|': function (c) {
			this.type('parameter');
			this.flush();
			return 'expecting-filter'
		},
		'}': function (c) {
			this.type('parameter');
			this.flush();
			return 'expecting-tag-end';
		},
		'"': function (c) {
			this.type('parameter');
			this.push(c);
			return 'double-quoted-parameter';
		},
		"'": function (c) {
			this.type('parameter');
			this.push(c);
			return 'single-quoted-parameter';
		},
		any: function (c) {
			this.type('parameter');
			this.push(c);
			return 'parameter';
		}
	},

	'parameter': {
		ws: function (c) {
			this.flush();
			return 'expecting-filter-end';
		},
		':': function (c) {
			this.flush();
			return 'expecting-parameter';
		},
		'|': function (c) {
			this.flush();
			return 'expecting-filter';
		},
		'}': function (c) {
			this.flush();
			return 'expecting-tag-end';
		},
		any: function (c) {
			this.push(c);
			return 'parameter';
		}
	},

	'double-quoted-parameter': {
		'"': function (c) {
			this.push(c);
			this.flush();
			return 'expecting-filter-end';
		},
		any: function (c) {
			this.push(c);
			return 'double-quoted-parameter';
		}
	},

	'single-quoted-parameter': {
		"'": function (c) {
			this.push(c);
			this.flush();
			return 'expecting-filter-end';
		},
		any: function (c) {
			this.push(c);
			return 'single-quoted-parameter';
		}
	},

	'expecting-tag': {
		ws: 'expecting-tag',
		alpha: function (c) {
			this.type('tag-name');
			this.push(c);
			return 'tag-name';
		},
		any: 'syntax-error'
	},

	'tag-name': {
		alphaNum: function (c) {
			this.push(c);
			return 'tag-name';
		},
		ws: function (c) {
			this.flush();
			return 'expecting-tag-body';
		},
		'%': function (c) {
			this.flush();
			return 'expecting-tag-end';
		},
		any: 'syntax-error'
	},

	'expecting-tag-body': {
		'%': 'expecting-tag-body-end',
		ws: 'expecting-tag-body',
		any: function (c) {
			this.type('tag-body');
			this.push(c);
			return 'tag-body';
		}
	},

	'expecting-tag-body-end': {
		'}': function (c) {
			this.flush();
			this.type('text');
			return 'text';
		},
		any: function (c) {
			this.push('%');
			this.push(c);
			return 'tag-body';
		}
	},

	'tag-body': {
		'%': 'expecting-tag-body-end',
		any: function (c) {
			this.push(c);
			return 'tag-body';
		}
	},

	'comment': {
		'#': 'expecting-comment-tag-end',
		any: 'comment'
	},

	'expecting-comment-tag-end': {
		'}': function () {
			this.type('text');
			return 'text';
		},
		any: 'comment'
	},

	'expecting-tag-end': {
		'}': function () {
			this.type('text');
			return 'text';
		},
		any: 'syntax-error'
	}
};

function isAlpha(c) { return /^[A-Z-_]$/i.test(c); }
function isAlphaNum(c) { return /^[A-Z0-9-_]$/i.test(c); }
function isWhitespace(c) { return /^\s$/.test(c); }

Parser.prototype = _(new EventEmitter).extend({
	input: function (c) {
		if (c === '\n') {
			this.lineNum++;
			this.charNum = 1;
		} else {
			this.charNum++;
		}
		var handler = Parser.stateActions[this.state], action, newState;

		if (typeof handler === 'undefined') {
			throw new Error('unable to transition to state: ' + this.state);
		}

		if (handler.hasOwnProperty(c)) { // handle exact matches first			
			action = handler[c];
		} else if (handler.hasOwnProperty('alpha') && isAlpha(c)) {
			action = handler['alpha'];
		} else if (handler.hasOwnProperty('alphaNum') && isAlphaNum(c)) {
			action = handler['alphaNum'];
		} else if (handler.hasOwnProperty('ws') && isWhitespace(c)) {
			action = handler['ws'];
		} else if (handler.hasOwnProperty('any')) {
			action = handler['any'];
		}

		if (!action) {
			return;
		}

		if (_(action).isFunction()) {
			newState = action.call(this, c);
		} else {
			newState = action;
		}

		if (newState === 'syntax-error') {
			throw new Error('encountered syntax error while parsing template. On line ' + this.lineNum + ' character ' + this.charNum + '.  State: '+ this.state);
		}
		if (this.state !== newState) {
			this.emit('transition', this.state, newState);
		}
		this.state = newState;
	},
	type: function (newType) {
		if (newType) {
			this.tokenType = newType;
			return this;
		} else {
			return this.tokenType;
		}
	},
	push: function (c) {
		if (typeof c !== undefined) {
			this.tokenBuffer.push(c);
		}
	},
	clear: function () {
		this.tokenType = 'text';
		this.tokenBuffer = [];
	},
	flush: function () {
		var token = this.tokenBuffer.join('');
		this.emit('token', this.tokenType, token);
		this.tokenType = '';
		this.tokenBuffer = [];
	},
	end: function () {
		this.flush();
		this.emit('end');
	}
});