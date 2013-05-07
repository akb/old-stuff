if (window.lsys) {
	lsys = window.lsys;
} else {
	window.lsys = lsys = {};
}

(function () {
	lsys.Renderer = function Renderer(lsys, turtle) {
		var turtleStack = [];
		this.lsys = lsys;
		this.turtle = turtle;
		this.rules = {
			'F': function () { this.turtle.draw(); },
			'f': function () { this.turtle.move(); },
			'+': function () { this.turtle.left(); },
			'-': function () { this.turtle.right(); },
			'[': function () { turtleStack.push(this.turtle.state()); },
			']': function () { this.turtle.state(turtleStack.pop()); }
		};
	}
	lsys.Renderer.prototype.render = function (iterations) {
		var desc = this.lsys.iterate(iterations)[iterations];
		for (var c in desc) {
			if (desc[c] in this.rules) {
				this.rules[desc[c]].call(this);
			}
		}
		this.turtle.done();
		return this;
	}
})();