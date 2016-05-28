function Pointer(a, b) {
	this.x = a;
	this.y = b;
	this.radius = 10;
}

Pointer.prototype.draw = function(c) {
	// draw the circle
	c.beginPath();
	c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
	c.fill();
};