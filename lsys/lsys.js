if (window.lsys) {
	lsys = window.lsys;
} else {
	window.lsys = lsys = {};
}

(function () {
	// Deterministic 0-context Lindenmeyer System (L-System)
	lsys.D0LSystem = function D0LSystem(axiom, rules) {
		this.axiom = axiom;
		this.rules = rules;
	};
	lsys.D0LSystem.prototype.iterate = function (numIterations) {
		function applyRules(word) {
			var out = '';
			for (var c in word) {
				if (word[c] in this.rules) {
					out = out + this.rules[word[c]]();
				} else {
					out = out + word[c];
				}
			}
			return out;
		}
		var iterations = [this.axiom];
		for (var i = 0; i < numIterations; i++) {
			iterations.push(applyRules.call(this, iterations[i]));
		}
		return iterations;
	};

})();