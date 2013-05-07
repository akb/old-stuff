var _ = require('underscore'),
    patterns;

module.exports = function pattern(name) {
    if (name in patterns) {
    	return {
    		pattern: patterns[name],
    		compare: function compare(match, identifier) {
                if (this.pattern.constructor === RegExp) {
                    return match.match(this.pattern);
                } else if (this.pattern.constructor === Array) {
                    return _(this.pattern).detect(function (pat) {
                        return compare.apply({
                            pattern: pat, 
                            compare: compare
                        }, [match, pat]);
                    });
                } else if (typeof this.pattern === 'function') {
                    return this.pattern(match, identifier);
                }
            }
    	};
    }
};

module.exports.patterns = patterns = {
    'string': function (match, identifier) { return identifier === match; },
    'regex': function (match, identifier) { return match.match(identifier); },
    'alpha': /^[A-Z]+$/i,
    'integer': /^\d+$/,
    'year': /^\d{1,4}$/,
    'month': [
        /^1?\d$/,
        /^jan(?:uary)?$/i,
        /^feb(?:ruary)?$/i,
        /^mar(?:ch)?$/i,
        /^apr(?:il)?$/i,
        /^jun(?:e)?$/i,
        /^jul(?:y)?$/i,
        /^aug(?:ust)?$/i,
        /^sep(?:t(?:ember)?)?$/i,
        /^oct(?:ober)?$/i,
        /^nov(?:ember)?$/i,
        /^dec(?:ember)?$/i
    ],
    'day': /^[0-2]?\d$|^3[0-1]$/
};