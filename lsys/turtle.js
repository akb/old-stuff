window.turtle = turtle = {}; (function () {
	function toRad(deg) { return deg * (Math.PI / 180); }

	turtle.Turtle = function Turtle(canvas, options) {
		options = options || {};
		this.x = options.initialX || 0;
		this.y = options.initialY || 0;
		this.stepSize = options.stepSize || 5;
		this.angleIncrement = options.angleIncrement || 90;
	
		if (canvas) {
			this.graphicsContext = document.getElementById(canvas).getContext('2d');
			this.graphicsContext.beginPath();
			this.graphicsContext.moveTo(this.x, this.y);
		}

		var heading = options.initialHeading || 0;
		this.heading = function (newHeading) {
			if (newHeading) {
				heading = newHeading;
				return this;
			} else {
				return heading;
			}
		};
	};
	function step() {
		var heading = this.heading();
		this.x = this.x + this.stepSize * Math.sin(toRad(heading));
		this.y = this.y + this.stepSize * Math.cos(toRad(heading));
		return this;
	}
	turtle.Turtle.prototype.draw = function () {
		step.call(this);
		this.graphicsContext.lineTo(this.x, this.y);
		return this;
	};
	turtle.Turtle.prototype.move = function () {
		step.call(this);
		this.graphicsContext.moveTo(newCoords.x, newCoords.y);
		return this;
	};
	turtle.Turtle.prototype.left = function () {
		var newHeading = this.heading() + this.angleIncrement;
		if (newHeading > 359) {
			this.heading(newHeading % 360);
		} else {
			this.heading(newHeading);
		}
		return this;
	};
	turtle.Turtle.prototype.right = function () {
		console.log("turning right. old heading: " + this.heading());
		var newHeading = this.heading() - this.angleIncrement;
		if (newHeading < 0) {
			this.heading(360 + newHeading % 360);
		} else {
			this.heading(newHeading);
		}
		return this;
	};
	turtle.Turtle.prototype.done = function () {
		this.graphicsContext.stroke();
	};
	turtle.Turtle.prototype.state = function (newState) {
		if (newState) {
			this.x = newState.x;
			this.y = newState.y;
			this.heading(newState.heading);
			this.graphicsContext.moveTo(this.x, this.y);
		} else {
			return {
				x: this.x,
				y: this.y,
				heading: this.heading()
			};
		}
	};

	turtle.DurpyTurtle = function DurpyTurtle(canvas, options) {
		turtle.Turtle.call(this, canvas, options); // inherit from Turtle
		this.durpiness = options.durpiness || 0;

		var heading = options.initialHeading;
		this.heading = function (newHeading) {
			if (newHeading) {
				heading = newHeading + (Math.floor(Math.random() * this.durpiness) - (this.durpiness / 2));
				return this;
			} else {
				return heading;
			}
		};
	};
	turtle.DurpyTurtle.prototype = new turtle.Turtle();

})();