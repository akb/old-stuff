$(document).ready(function () {

	var quadraticKochIsland = {
		lsys: new lsys.D0LSystem('F+F+F+F', {
			'F': function () { return 'F+F-F-FF+F+F-F'; }
		}),
		turtle: new turtle.Turtle('output-canvas', {
			initialX: 350,
			initialY: 350,
			initialHeading: 90,
			stepSize: 20,
			angleIncrement: 90
		}),
		render: function (iterations) {
			new lsys.Renderer(this.lsys, this.turtle).render(iterations);
		}
	};

	var quadraticKochIsland2 = {
		lsys: new lsys.D0LSystem('F+F+F+F', {
			'F': function () { return 'F-FF+FF+F+F-F-FF+F+F-F-FF-FF+F'; }
		}),
		turtle: new turtle.Turtle('output-canvas', {
			initialX: 450,
			initialY: 450,
			initialHeading: 90,
			stepSize: 4,
			angleIncrement: 90
		}),
		render: function (iterations) {
			new lsys.Renderer(this.lsys, this.turtle).render(iterations);
		}
	};

	var sampleTree = {
		lsys: new lsys.D0LSystem('F', {
			'F': function () { return 'F[-F]F[+F][F]'; }
		}),
		turtle: new turtle.DurpyTurtle('output-canvas', {
			initialX: 450,
			initialY: 450,
			initialHeading: 180,
			stepSize: 15,
			angleIncrement: 30,
			durpiness: 15
		}),
		render: function (iterations) {
			new lsys.Renderer(this.lsys, this.turtle).render(iterations);
		}
	};
	quadraticKochIsland.render(1);
});